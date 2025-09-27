import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createAccessSchema = z.object({
  userId: z.string().optional(),
  groupId: z.string().optional(),
  integrationType: z.enum(['SOCIAL_MEDIA', 'CALENDAR', 'EMAIL', 'SMS', 'PAYMENT', 'BANKING', 'CRYPTO', 'CRM', 'ANALYTICS', 'STORAGE', 'OTHER']),
  accessLevel: z.enum(['READ', 'WRITE', 'ADMIN', 'FULL']),
  permissions: z.record(z.any()).optional(),
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
    const userId = searchParams.get('userId');
    const integrationType = searchParams.get('integrationType');

    const where: any = {
      organizationId: user.organization.id,
    };

    if (userId) where.userId = userId;
    if (integrationType) where.integrationType = integrationType;

    const accessRules = await prisma.integrationAccess.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        group: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ accessRules });
  } catch (error) {
    console.error('Error fetching integration access:', error);
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

    // Only admins can manage access
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createAccessSchema.parse(body);

    // Must specify either userId or groupId
    if (!validatedData.userId && !validatedData.groupId) {
      return NextResponse.json({ error: 'Must specify either userId or groupId' }, { status: 400 });
    }

    const accessRule = await prisma.integrationAccess.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        group: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    return NextResponse.json(accessRule, { status: 201 });
  } catch (error) {
    console.error('Error creating integration access:', error);
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
