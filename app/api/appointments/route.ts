import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { realtimeEvents } from '@/lib/websocket';
import { trackEvent } from '@/lib/analytics';
import notificationService from '@/lib/notification-service';

export const dynamic = 'force-dynamic';

const createAppointmentSchema = z.object({
  customerId: z.string().cuid('Invalid customer ID'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  type: z.enum(['MAINTENANCE', 'REPAIR', 'INSTALLATION', 'INSPECTION', 'CONSULTATION', 'EMERGENCY', 'OTHER']).default('OTHER'),
  location: z.string().optional(),
  assignedUserId: z.string().cuid().optional(),
  estimatedDuration: z.number().min(15).max(480).default(60), // 15 minutes to 8 hours
  price: z.number().min(0).optional(),
  notes: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.any()).optional(),
  sendReminder: z.boolean().default(true),
  reminderTime: z.number().default(24) // hours before appointment
});

const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional()
});

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const assignedUserId = searchParams.get('assignedUserId') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: user.organizationId,
      ...(status && { status }),
      ...(type && { type }),
      ...(assignedUserId && { assignedUserId }),
      ...(startDate && endDate && {
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true
            }
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          invoices: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              total: true
            }
          }
        }
      }),
      prisma.appointment.count({ where })
    ]);

    // Get appointment stats
    const stats = await prisma.appointment.groupBy({
      by: ['status'],
      where: { organizationId: user.organizationId },
      _count: { _all: true }
    });

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats.reduce((acc, stat) => ({
        ...acc,
        [stat.status.toLowerCase()]: stat._count._all
      }), {})
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createAppointmentSchema.parse(body);

    // Validate customer belongs to organization
    const customer = await prisma.customer.findUnique({
      where: { 
        id: validatedData.customerId,
        organizationId: user.organizationId
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or does not belong to your organization' },
        { status: 400 }
      );
    }

    // Validate assigned user if provided
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

    // Check for scheduling conflicts
    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    if (validatedData.assignedUserId) {
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          assignedUserId: validatedData.assignedUserId,
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

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        ...validatedData,
        startTime,
        endTime,
        organizationId: user.organizationId,
        createdBy: user.id,
        status: 'SCHEDULED',
        location: validatedData.location || customer.address || ''
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            preferences: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Track analytics
    await trackEvent(user.organizationId, 'appointment_created', {
      appointmentId: appointment.id,
      customerId: appointment.customerId,
      type: appointment.type,
      duration: validatedData.estimatedDuration
    });

    // Send appointment confirmation
    if (validatedData.sendReminder) {
      try {
        await notificationService.sendBookingConfirmation({
          customerId: appointment.customerId,
          appointmentId: appointment.id,
          customerName: appointment.customer.name,
          customerEmail: appointment.customer.email || '',
          customerPhone: appointment.customer.phone || '',
          appointmentDate: appointment.startTime.toISOString(),
          serviceType: appointment.title,
          technician: appointment.assignedUser?.name || 'TBD',
          location: appointment.location,
          estimatedDuration: validatedData.estimatedDuration,
          notes: appointment.notes || ''
        });
      } catch (notificationError) {
        console.error('Failed to send appointment confirmation:', notificationError);
      }
    }

    // Emit real-time event
    realtimeEvents.appointmentCreated(user.organizationId, appointment);

    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      appointment
    }, { status: 201 });

  } catch (error) {
    console.error('Create appointment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid appointment data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
