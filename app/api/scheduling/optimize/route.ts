import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { schedulingAI } from '@/lib/scheduling-ai';

export const dynamic = 'force-dynamic';

const optimizeScheduleSchema = z.object({
  date: z.string().datetime('Invalid date'),
  autoApply: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins and managers can optimize schedules
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { date, autoApply } = optimizeScheduleSchema.parse(body);

    const ai = schedulingAI.getInstance(user.organizationId);
    const result = await ai.optimizeSchedule(new Date(date));

    // If autoApply is true and there are improvements, apply the changes
    if (autoApply && result.optimized && result.changes.length > 0) {
      for (const change of result.changes) {
        await prisma.appointment.update({
          where: { id: change.appointmentId },
          data: {
            startTime: change.newStartTime,
            notes: `Optimized: ${change.reason}`
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      optimization: result,
      applied: autoApply && result.optimized
    });

  } catch (error) {
    console.error('Schedule optimization error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to optimize schedule' },
      { status: 500 }
    );
  }
}
