import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { realtimeEvents } from '@/lib/websocket';

export const dynamic = 'force-dynamic';

const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  customerType: z.enum(['RESIDENTIAL', 'COMMERCIAL']).optional(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'GOOGLE', 'FACEBOOK', 'PHONE', 'OTHER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEAD', 'BLOCKED']).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  preferences: z.object({
    communication: z.enum(['EMAIL', 'SMS', 'PHONE']),
    appointmentReminders: z.boolean(),
    marketingEmails: z.boolean()
  }).optional(),
  customFields: z.record(z.string(), z.any()).optional()
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

    const customerId = params.id;

    const customer = await prisma.customer.findUnique({
      where: { 
        id: customerId,
        organizationId: user.organizationId
      },
      include: {
        appointments: {
          orderBy: { startTime: 'desc' },
          include: {
            assignedUser: {
              select: { id: true, name: true, email: true }
            },
            invoices: true
          }
        },
        invoices: {
          orderBy: { createdAt: 'desc' }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        _count: {
          select: {
            appointments: true,
            invoices: true,
            messages: true
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calculate customer stats
    const totalRevenue = customer.invoices
      .filter(invoice => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + invoice.total, 0);

    const completedJobs = customer.appointments
      .filter(apt => apt.status === 'COMPLETED').length;

    const lastAppointment = customer.appointments[0];
    const lastContact = customer.messages[0];

    return NextResponse.json({
      customer: {
        ...customer,
        stats: {
          totalRevenue,
          completedJobs,
          totalAppointments: customer._count.appointments,
          totalInvoices: customer._count.invoices,
          totalMessages: customer._count.messages,
          lastAppointment: lastAppointment?.startTime,
          lastContact: lastContact?.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
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

    const customerId = params.id;
    const body = await request.json();
    const validatedData = updateCustomerSchema.parse(body);

    // Check if customer exists and belongs to organization
    const existingCustomer = await prisma.customer.findUnique({
      where: { 
        id: customerId,
        organizationId: user.organizationId
      }
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check for duplicate email/phone if being updated
    if (validatedData.email && validatedData.email !== existingCustomer.email) {
      const existingByEmail = await prisma.customer.findFirst({
        where: {
          organizationId: user.organizationId,
          email: validatedData.email,
          id: { not: customerId }
        }
      });

      if (existingByEmail) {
        return NextResponse.json(
          { error: 'Another customer with this email already exists' },
          { status: 409 }
        );
      }
    }

    if (validatedData.phone && validatedData.phone !== existingCustomer.phone) {
      const existingByPhone = await prisma.customer.findFirst({
        where: {
          organizationId: user.organizationId,
          phone: validatedData.phone,
          id: { not: customerId }
        }
      });

      if (existingByPhone) {
        return NextResponse.json(
          { error: 'Another customer with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            appointments: true,
            invoices: true,
            messages: true
          }
        }
      }
    });

    // Emit real-time event
    realtimeEvents.customerUpdated(user.organizationId, customerId, updatedCustomer);

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });

  } catch (error) {
    console.error('Update customer error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update customer' },
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

    // Only admins and managers can delete customers
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const customerId = params.id;

    // Check if customer exists and belongs to organization
    const customer = await prisma.customer.findUnique({
      where: { 
        id: customerId,
        organizationId: user.organizationId
      },
      include: {
        appointments: true,
        invoices: true
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check if customer has active appointments or unpaid invoices
    const hasActiveAppointments = customer.appointments.some(
      apt => ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(apt.status)
    );

    const hasUnpaidInvoices = customer.invoices.some(
      invoice => ['PENDING', 'OVERDUE'].includes(invoice.status)
    );

    if (hasActiveAppointments) {
      return NextResponse.json(
        { error: 'Cannot delete customer with active appointments' },
        { status: 400 }
      );
    }

    if (hasUnpaidInvoices) {
      return NextResponse.json(
        { error: 'Cannot delete customer with unpaid invoices' },
        { status: 400 }
      );
    }

    // Soft delete by updating status
    await prisma.customer.update({
      where: { id: customerId },
      data: { 
        status: 'INACTIVE',
        deletedAt: new Date(),
        email: customer.email ? `deleted_${Date.now()}_${customer.email}` : null,
        phone: customer.phone ? `deleted_${Date.now()}_${customer.phone}` : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
