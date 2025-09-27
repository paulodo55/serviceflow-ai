import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSessionSchema = z.object({
  traineeId: z.string().min(1, 'Trainee ID is required'),
  trainerId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)).optional(),
  recordingEnabled: z.boolean().default(true),
  totalSteps: z.number().optional(),
  knowledgeBaseIds: z.array(z.string()).default([]),
});

const updateProgressSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  completedSteps: z.array(z.string()),
  progressPercent: z.number().min(0).max(100),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PAUSED']).optional(),
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
    const traineeId = searchParams.get('traineeId');
    const trainerId = searchParams.get('trainerId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organization.id,
    };

    if (traineeId) where.traineeId = traineeId;
    if (trainerId) where.trainerId = trainerId;
    if (status) where.status = status;

    // Users can only see their own training sessions unless they're admin/manager
    if (user.role === 'STAFF') {
      where.OR = [
        { traineeId: user.id },
        { trainerId: user.id },
      ];
    }

    const [sessions, total] = await Promise.all([
      prisma.trainingSession.findMany({
        where,
        include: {
          trainee: {
            select: { id: true, name: true, email: true, role: true },
          },
          trainer: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.trainingSession.count({ where }),
    ]);

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching training sessions:', error);
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

    // Only admins and managers can create training sessions
    if (user.role === 'STAFF') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);

    // Verify trainee exists in organization
    const trainee = await prisma.user.findFirst({
      where: {
        id: validatedData.traineeId,
        organizationId: user.organization.id,
      },
    });

    if (!trainee) {
      return NextResponse.json({ error: 'Trainee not found' }, { status: 404 });
    }

    // Verify trainer exists if specified
    if (validatedData.trainerId) {
      const trainer = await prisma.user.findFirst({
        where: {
          id: validatedData.trainerId,
          organizationId: user.organization.id,
        },
      });

      if (!trainer) {
        return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
      }
    }

    const trainingSession = await prisma.trainingSession.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
        trainerId: validatedData.trainerId || user.id, // Default to current user as trainer
      },
      include: {
        trainee: {
          select: { id: true, name: true, email: true, role: true },
        },
        trainer: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(trainingSession, { status: 201 });
  } catch (error) {
    console.error('Error creating training session:', error);
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

// Update training progress
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
    const validatedData = updateProgressSchema.parse(body);

    // Verify session exists and user has access
    const trainingSession = await prisma.trainingSession.findFirst({
      where: {
        id: validatedData.sessionId,
        organizationId: user.organization.id,
        OR: [
          { traineeId: user.id },
          { trainerId: user.id },
          ...(user.role !== 'STAFF' ? [{}] : []), // Admins/managers can access all
        ],
      },
    });

    if (!trainingSession) {
      return NextResponse.json({ error: 'Training session not found' }, { status: 404 });
    }

    // Update session progress
    const updateData: any = {
      completedSteps: validatedData.completedSteps,
      progressPercent: validatedData.progressPercent,
    };

    if (validatedData.status) {
      updateData.status = validatedData.status;
      
      // Set end time if completing
      if (validatedData.status === 'COMPLETED') {
        updateData.endTime = new Date();
        updateData.duration = Math.round(
          (new Date().getTime() - trainingSession.startTime.getTime()) / 60000
        ); // Duration in minutes
      }
    }

    const updatedSession = await prisma.trainingSession.update({
      where: { id: validatedData.sessionId },
      data: updateData,
      include: {
        trainee: {
          select: { id: true, name: true, email: true, role: true },
        },
        trainer: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error updating training progress:', error);
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

// Start recording endpoint
export async function PUT(request: NextRequest) {
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
    const { sessionId, action, recordingUrl } = body;

    if (!sessionId || !action) {
      return NextResponse.json({ 
        error: 'Session ID and action are required' 
      }, { status: 400 });
    }

    const trainingSession = await prisma.trainingSession.findFirst({
      where: {
        id: sessionId,
        organizationId: user.organization.id,
      },
    });

    if (!trainingSession) {
      return NextResponse.json({ error: 'Training session not found' }, { status: 404 });
    }

    let updateData: any = {};

    switch (action) {
      case 'start_recording':
        updateData = {
          status: 'IN_PROGRESS',
          recordingEnabled: true,
        };
        break;
      case 'stop_recording':
        updateData = {
          recordingUrl: recordingUrl || null,
          endTime: new Date(),
          duration: Math.round(
            (new Date().getTime() - trainingSession.startTime.getTime()) / 60000
          ),
        };
        break;
      case 'pause':
        updateData = { status: 'PAUSED' };
        break;
      case 'resume':
        updateData = { status: 'IN_PROGRESS' };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedSession = await prisma.trainingSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        trainee: {
          select: { id: true, name: true, email: true, role: true },
        },
        trainer: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({
      message: `Training session ${action} successful`,
      session: updatedSession,
    });
  } catch (error) {
    console.error('Error managing training session recording:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
