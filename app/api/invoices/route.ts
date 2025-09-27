import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { realtimeEvents } from '@/lib/websocket';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be non-negative'),
  amount: z.number().min(0, 'Amount must be non-negative')
});

const createInvoiceSchema = z.object({
  customerId: z.string().cuid('Invalid customer ID'),
  appointmentId: z.string().cuid().optional(),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  tax: z.number().min(0, 'Tax must be non-negative').default(0),
  total: z.number().min(0, 'Total must be non-negative'),
  dueDate: z.string().datetime('Invalid due date'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  paymentMethods: z.array(z.string()).default(['CASH', 'CHECK', 'CARD']),
  sendEmail: z.boolean().default(true)
});

const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  paidDate: z.string().datetime().optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional()
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
    const customerId = searchParams.get('customerId') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: user.organizationId,
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          appointment: {
            select: {
              id: true,
              title: true,
              startTime: true,
              status: true
            }
          }
        }
      }),
      prisma.invoice.count({ where })
    ]);

    // Calculate invoice stats
    const stats = await prisma.invoice.groupBy({
      by: ['status'],
      where: { organizationId: user.organizationId },
      _count: { _all: true },
      _sum: { total: true }
    });

    const totalRevenue = await prisma.invoice.aggregate({
      where: {
        organizationId: user.organizationId,
        status: 'PAID'
      },
      _sum: { total: true }
    });

    const overdueInvoices = await prisma.invoice.count({
      where: {
        organizationId: user.organizationId,
        status: 'PENDING',
        dueDate: { lt: new Date() }
      }
    });

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        ...stats.reduce((acc, stat) => ({
          ...acc,
          [stat.status.toLowerCase()]: {
            count: stat._count._all,
            total: stat._sum.total || 0
          }
        }), {}),
        totalRevenue: totalRevenue._sum.total || 0,
        overdueCount: overdueInvoices
      }
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
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
    const validatedData = createInvoiceSchema.parse(body);

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

    // Validate appointment if provided
    if (validatedData.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { 
          id: validatedData.appointmentId,
          organizationId: user.organizationId,
          customerId: validatedData.customerId
        }
      });

      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found or does not belong to the specified customer' },
          { status: 400 }
        );
      }

      // Check if appointment already has an invoice
      const existingInvoice = await prisma.invoice.findFirst({
        where: { appointmentId: validatedData.appointmentId }
      });

      if (existingInvoice) {
        return NextResponse.json(
          { error: 'This appointment already has an invoice' },
          { status: 409 }
        );
      }
    }

    // Generate invoice number
    const currentYear = new Date().getFullYear();
    const lastInvoice = await prisma.invoice.findFirst({
      where: { 
        organizationId: user.organizationId,
        invoiceNumber: { startsWith: `INV-${currentYear}-` }
      },
      orderBy: { createdAt: 'desc' }
    });

    let invoiceNumber: string;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      invoiceNumber = `INV-${currentYear}-${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      invoiceNumber = `INV-${currentYear}-001`;
    }

    // Validate calculated totals
    const calculatedAmount = validatedData.items.reduce((sum, item) => sum + item.amount, 0);
    const calculatedTotal = calculatedAmount + validatedData.tax;

    if (Math.abs(calculatedAmount - validatedData.amount) > 0.01) {
      return NextResponse.json(
        { error: 'Amount does not match item totals' },
        { status: 400 }
      );
    }

    if (Math.abs(calculatedTotal - validatedData.total) > 0.01) {
      return NextResponse.json(
        { error: 'Total does not match amount plus tax' },
        { status: 400 }
      );
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        ...validatedData,
        invoiceNumber,
        dueDate: new Date(validatedData.dueDate),
        organizationId: user.organizationId,
        createdBy: user.id,
        status: 'PENDING'
      },
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
        appointment: {
          select: {
            id: true,
            title: true,
            startTime: true,
            status: true
          }
        }
      }
    });

    // Track analytics
    await trackEvent(user.organizationId, 'invoice_created', {
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount: invoice.total,
      appointmentId: invoice.appointmentId
    });

    // Send invoice email if requested
    if (validatedData.sendEmail && customer.email) {
      try {
        // TODO: Implement invoice email sending
        console.log(`Would send invoice ${invoiceNumber} to ${customer.email}`);
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
      }
    }

    // Emit real-time event
    realtimeEvents.invoiceCreated(user.organizationId, invoice);

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice
    }, { status: 201 });

  } catch (error) {
    console.error('Create invoice error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid invoice data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
