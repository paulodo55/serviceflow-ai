import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createEventSchema = z.object({
  integrationId: z.string().min(1, 'Integration ID is required'),
  appointmentId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
  isAllDay: z.boolean().default(false),
  timezone: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
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
    const integrationId = searchParams.get('integrationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    const where: any = {
      organizationId: user.organization.id,
    };

    if (integrationId) where.integrationId = integrationId;
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        integration: {
          select: { 
            id: true, 
            provider: true, 
            calendarName: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        appointment: {
          select: { 
            id: true, 
            title: true, 
            customer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
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
    const validatedData = createEventSchema.parse(body);

    // Verify integration belongs to organization
    const integration = await prisma.calendarIntegration.findFirst({
      where: {
        id: validatedData.integrationId,
        organizationId: user.organization.id,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Calendar integration not found' }, { status: 404 });
    }

    // Generate external ID for the event
    const externalId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const event = await prisma.calendarEvent.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
        externalId,
        status: 'CONFIRMED',
        lastSyncAt: new Date(),
      },
      include: {
        integration: {
          select: { 
            id: true, 
            provider: true, 
            calendarName: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        appointment: {
          select: { 
            id: true, 
            title: true, 
            customer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // In a real implementation, you would also create the event in the external calendar
    // using the provider's API (Google Calendar, Apple Calendar, etc.)
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
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

// Sync appointments to calendar
export async function PATCH(request: NextRequest) {
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
    const { appointmentId, integrationId } = body;

    if (!appointmentId || !integrationId) {
      return NextResponse.json({ 
        error: 'Appointment ID and Integration ID required' 
      }, { status: 400 });
    }

    // Get appointment details
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        organizationId: user.organization.id,
      },
      include: {
        customer: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Get integration
    const integration = await prisma.calendarIntegration.findFirst({
      where: {
        id: integrationId,
        organizationId: user.organization.id,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Calendar integration not found' }, { status: 404 });
    }

    // Create or update calendar event
    const externalId = `appt_${appointment.id}`;
    const event = await prisma.calendarEvent.upsert({
      where: {
        integrationId_externalId: {
          integrationId: integration.id,
          externalId,
        },
      },
      create: {
        organizationId: user.organization.id,
        integrationId: integration.id,
        appointmentId: appointment.id,
        externalId,
        title: appointment.title,
        description: `${appointment.description || ''}\n\nCustomer: ${appointment.customer.name}\nService: ${appointment.service?.name || 'N/A'}`,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: 'CONFIRMED',
        lastSyncAt: new Date(),
      },
      update: {
        title: appointment.title,
        description: `${appointment.description || ''}\n\nCustomer: ${appointment.customer.name}\nService: ${appointment.service?.name || 'N/A'}`,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        lastSyncAt: new Date(),
      },
      include: {
        integration: {
          select: { 
            id: true, 
            provider: true, 
            calendarName: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      message: 'Appointment synced to calendar successfully',
      event,
    });
  } catch (error) {
    console.error('Error syncing appointment to calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
