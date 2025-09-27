import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const connectCalendarSchema = z.object({
  provider: z.enum(['GOOGLE', 'APPLE', 'OUTLOOK', 'EXCHANGE', 'CALDAV']),
  accountEmail: z.string().email('Valid email required'),
  calendarId: z.string().min(1, 'Calendar ID is required'),
  calendarName: z.string().min(1, 'Calendar name is required'),
  syncDirection: z.enum(['IMPORT_ONLY', 'EXPORT_ONLY', 'BIDIRECTIONAL']).default('BIDIRECTIONAL'),
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().transform((str) => new Date(str)).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const userId = searchParams.get('userId');

    const where: any = {
      organizationId: user.organization.id,
    };

    if (provider) where.provider = provider;
    if (userId) where.userId = userId;

    const integrations = await prisma.calendarIntegration.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { events: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Don't expose sensitive tokens
    const safeIntegrations = integrations.map(integration => ({
      ...integration,
      accessToken: '[HIDDEN]',
      refreshToken: integration.refreshToken ? '[HIDDEN]' : null,
    }));

    return NextResponse.json({ integrations: safeIntegrations });
  } catch (error) {
    console.error('Error fetching calendar integrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = connectCalendarSchema.parse(body);

    // Check if integration already exists
    const existingIntegration = await prisma.calendarIntegration.findFirst({
      where: {
        organizationId: user.organization.id,
        userId: user.id,
        provider: validatedData.provider,
        calendarId: validatedData.calendarId,
      },
    });

    if (existingIntegration) {
      return NextResponse.json(
        { error: 'Calendar integration already exists' },
        { status: 409 }
      );
    }

    const integration = await prisma.calendarIntegration.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { events: true },
        },
      },
    });

    // Start initial sync
    await syncCalendarEvents(integration.id);

    // Don't expose sensitive data
    const safeIntegration = {
      ...integration,
      accessToken: '[HIDDEN]',
      refreshToken: integration.refreshToken ? '[HIDDEN]' : null,
    };

    return NextResponse.json(safeIntegration, { status: 201 });
  } catch (error) {
    console.error('Error connecting calendar:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues || [] },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Sync calendar events
async function syncCalendarEvents(integrationId: string) {
  try {
    const integration = await prisma.calendarIntegration.findUnique({
      where: { id: integrationId },
      include: { organization: true },
    });

    if (!integration) return;

    // This would integrate with actual calendar APIs
    // For demo purposes, we'll create some mock events
    const mockEvents = [
      {
        externalId: 'event_1',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        startTime: new Date('2024-01-16T10:00:00Z'),
        endTime: new Date('2024-01-16T11:00:00Z'),
        location: 'Conference Room A',
      },
      {
        externalId: 'event_2',
        title: 'Client Call',
        description: 'Quarterly review with client',
        startTime: new Date('2024-01-16T14:00:00Z'),
        endTime: new Date('2024-01-16T15:00:00Z'),
        location: 'Zoom',
      },
    ];

    // Create or update events
    for (const eventData of mockEvents) {
      await prisma.calendarEvent.upsert({
        where: {
          integrationId_externalId: {
            integrationId: integration.id,
            externalId: eventData.externalId,
          },
        },
        create: {
          ...eventData,
          organizationId: integration.organizationId,
          integrationId: integration.id,
          status: 'CONFIRMED',
          lastSyncAt: new Date(),
        },
        update: {
          ...eventData,
          lastSyncAt: new Date(),
        },
      });
    }

    // Update last sync time
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() },
    });
  } catch (error) {
    console.error('Error syncing calendar events:', error);
  }
}

// Manual sync endpoint
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { integrationId } = body;

    if (!integrationId) {
      return NextResponse.json({ error: 'Integration ID required' }, { status: 400 });
    }

    await syncCalendarEvents(integrationId);

    return NextResponse.json({ message: 'Sync completed successfully' });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
