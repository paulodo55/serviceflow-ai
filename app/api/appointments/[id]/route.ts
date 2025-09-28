import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { realtimeEvents } from '@/lib/websocket';
import { trackEvent } from '@/lib/analytics';
import notificationService from '@/lib/notification-service';

export const dynamic = 'force-dynamic';

const updateAppointmentSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  type: z.enum(['MAINTENANCE', 'REPAIR', 'INSTALLATION', 'INSPECTION', 'CONSULTATION', 'EMERGENCY', 'OTHER']).optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  location: z.string().optional(),
  assignedUserId: z.string().cuid().nullable().optional(),
  estimatedDuration: z.number().min(15).max(480).optional(),
  price: z.number().min(0).nullable().optional(),
  notes: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  completionNotes: z.string().optional(),
  actualDuration: z.number().min(0).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const appointmentId = params.id;

    const appointment = await prisma.appointment.findUnique({
      where: { 
        id: appointmentId,
        organizationId: user.organizationId
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            dueDate: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ appointment });

  } catch (error) {
    console.error('Get appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const appointmentId = params.id;
    const body = await request.json();
    const validatedData = updateAppointmentSchema.parse(body);

    // Check if appointment exists and belongs to organization
    const existingAppointment = await prisma.appointment.findUnique({
      where: { 
        id: appointmentId,
        organizationId: user.organizationId
      },
      include: {
        customer: true,
        assignedUser: true
      }
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Validate assigned user if being updated
    if (validatedData.assignedUserId !== undefined) {
      if (validatedData.assignedUserId) {
        const assignedUser = await prisma.user.findUnique({
          where: { 
            id: validatedData.assignedUserId,
            organizationId: user.organizationId
          }
        });

        if (!assignedUser) {
          return NextResponse.json(
            { error: 'Assigned user not found or does not belong to your organization' },
            { status: 400 }
          );
        }
      }
    }

    // Check for scheduling conflicts if times are being updated
    if (validatedData.startTime || validatedData.endTime) {
      const startTime = validatedData.startTime ? new Date(validatedData.startTime) : existingAppointment.startTime;
      const endTime = validatedData.endTime ? new Date(validatedData.endTime) : existingAppointment.endTime;

      if (startTime >= endTime) {
        return NextResponse.json(
          { error: 'Start time must be before end time' },
          { status: 400 }
        );
      }

      const assignedUserId = validatedData.assignedUserId !== undefined ? 
        validatedData.assignedUserId : existingAppointment.assignedUserId;

      if (assignedUserId) {
        const conflictingAppointment = await prisma.appointment.findFirst({
          where: {
            id: { not: appointmentId },
            assignedUserId,
            status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            OR: [
              {
                startTime: { lte: startTime },
                endTime: { gt: startTime }
              },
              {
                startTime: { lt: endTime },
                endTime: { gte: endTime }
              },
              {
                startTime: { gte: startTime },
                endTime: { lte: endTime }
              }
            ]
          },
          include: {
            customer: { select: { name: true } }
          }
        });

        if (conflictingAppointment) {
          return NextResponse.json(
            { 
              error: 'Scheduling conflict detected',
              conflict: {
                appointmentId: conflictingAppointment.id,
                customerName: conflictingAppointment.customer.name,
                startTime: conflictingAppointment.startTime,
                endTime: conflictingAppointment.endTime
              }
            },
            { status: 409 }
          );
        }
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...validatedData,
        ...(validatedData.startTime && { startTime: new Date(validatedData.startTime) }),
        ...(validatedData.endTime && { endTime: new Date(validatedData.endTime) }),
        updatedAt: new Date(),
        ...(validatedData.status === 'COMPLETED' && !existingAppointment.completedAt && {
          completedAt: new Date()
        })
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true
          }
        }
      }
    });

    // Track analytics for status changes
    if (validatedData.status && validatedData.status !== existingAppointment.status) {
      await trackEvent(user.organizationId, 'appointment_status_changed', {
        appointmentId,
        oldStatus: existingAppointment.status,
        newStatus: validatedData.status,
        customerId: existingAppointment.customerId
      });

      if (validatedData.status === 'COMPLETED') {
        await trackEvent(user.organizationId, 'appointment_completed', {
          appointmentId,
          customerId: existingAppointment.customerId,
          duration: validatedData.actualDuration || existingAppointment.estimatedDuration,
          revenue: existingAppointment.price || 0
        });
      }
    }

    // Send notifications for status changes
    if (validatedData.status && validatedData.status !== existingAppointment.status) {
      try {
        const customer = updatedAppointment.customer;
        const statusMessages = {
          CONFIRMED: 'Your appointment has been confirmed',
          IN_PROGRESS: 'Your technician is on the way',
          COMPLETED: 'Your service has been completed',
          CANCELLED: 'Your appointment has been cancelled'
        };

        const message = statusMessages[validatedData.status as keyof typeof statusMessages];
        if (message && customer.preferences?.communication) {
          // Send status update notification
          // Implementation would depend on customer's preferred communication method
        }
      } catch (notificationError) {
        console.error('Failed to send status update notification:', notificationError);
      }
    }

    // Emit real-time event
    realtimeEvents.appointmentUpdated(user.organizationId, appointmentId, updatedAppointment);

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid appointment data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only admins and managers can delete appointments
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const appointmentId = params.id;

    // Check if appointment exists and belongs to organization
    const appointment = await prisma.appointment.findUnique({
      where: { 
        id: appointmentId,
        organizationId: user.organizationId
      },
      include: {
        customer: true,
        invoice: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Prevent deletion of completed appointments with invoices
    if (appointment.status === 'COMPLETED' && appointment.invoice) {
      return NextResponse.json(
        { error: 'Cannot delete completed appointment with associated invoice' },
        { status: 400 }
      );
    }

    // Soft delete by updating status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        status: 'CANCELLED',
        notes: `${appointment.notes || ''}\n\nCancelled by ${user.name} on ${new Date().toISOString()}`.trim()
      }
    });

    // Emit real-time event
    realtimeEvents.appointmentDeleted(user.organizationId, appointmentId);

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
