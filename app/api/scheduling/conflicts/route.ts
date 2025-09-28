import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { schedulingAI } from '@/lib/scheduling-ai';

export const dynamic = 'force-dynamic';

const conflictCheckSchema = z.object({
  technicianId: z.string().cuid('Invalid technician ID'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  excludeAppointmentId: z.string().cuid().optional()
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

    const body = await request.json();
    const validatedData = conflictCheckSchema.parse(body);

    // Validate technician belongs to organization
    const technician = await prisma.user.findUnique({
      where: { 
        id: validatedData.technicianId,
        organizationId: user.organizationId
      }
    });

    if (!technician) {
      return NextResponse.json(
        { error: 'Technician not found or does not belong to your organization' },
        { status: 400 }
      );
    }

    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    const ai = schedulingAI.getInstance(user.organizationId);
    const conflicts = await ai.detectConflicts(
      validatedData.technicianId,
      startTime,
      endTime,
      validatedData.excludeAppointmentId
    );

    const hasHighSeverityConflicts = conflicts.some(c => c.severity === 'high');
    const hasMediumSeverityConflicts = conflicts.some(c => c.severity === 'medium');

    return NextResponse.json({
      success: true,
      hasConflicts: conflicts.length > 0,
      canSchedule: !hasHighSeverityConflicts,
      needsAttention: hasMediumSeverityConflicts,
      conflicts,
      summary: {
        total: conflicts.length,
        high: conflicts.filter(c => c.severity === 'high').length,
        medium: conflicts.filter(c => c.severity === 'medium').length,
        low: conflicts.filter(c => c.severity === 'low').length
      },
      recommendation: getRecommendation(conflicts)
    });

  } catch (error) {
    console.error('Conflict detection error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check for conflicts' },
      { status: 500 }
    );
  }
}

function getRecommendation(conflicts: any[]): string {
  const highConflicts = conflicts.filter(c => c.severity === 'high').length;
  const mediumConflicts = conflicts.filter(c => c.severity === 'medium').length;
  
  if (highConflicts > 0) {
    return 'Cannot schedule - direct time conflicts detected. Please choose a different time slot.';
  } else if (mediumConflicts > 0) {
    return 'Can schedule with caution - travel time may be tight. Consider adjusting appointment times.';
  } else if (conflicts.length > 0) {
    return 'Can schedule - minor considerations noted but no significant conflicts.';
  } else {
    return 'Perfect time slot - no conflicts detected.';
  }
}
