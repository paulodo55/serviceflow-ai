import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { realtimeEvents } from '@/lib/websocket';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  rate: z.number().min(0),
  amount: z.number().min(0)
});

const updateInvoiceSchema = z.object({
  description: z.string().min(2).optional(),
  items: z.array(invoiceItemSchema).optional(),
  amount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  paidDate: z.string().datetime().optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentMethods: z.array(z.string()).optional()
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

    const invoiceId = params.id;

    const invoice = await prisma.invoice.findUnique({
      where: { 
        id: invoiceId,
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
            customerType: true
          }
        },
        appointment: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            status: true,
            location: true,
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            settings: true
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

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });

  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
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

    const invoiceId = params.id;
    const body = await request.json();
    const validatedData = updateInvoiceSchema.parse(body);

    // Check if invoice exists and belongs to organization
    const existingInvoice = await prisma.invoice.findUnique({
      where: { 
        id: invoiceId,
        organizationId: user.organizationId
      }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Prevent modification of paid invoices (except for payment details)
    if (existingInvoice.status === 'PAID' && validatedData.status !== 'PAID') {
      const allowedFields = ['paymentMethod', 'paymentReference', 'notes'];
      const hasDisallowedChanges = Object.keys(validatedData).some(
        key => !allowedFields.includes(key) && validatedData[key as keyof typeof validatedData] !== undefined
      );

      if (hasDisallowedChanges) {
        return NextResponse.json(
          { error: 'Cannot modify paid invoices except for payment details' },
          { status: 400 }
        );
      }
    }

    // Validate calculated totals if items/amounts are being updated
    if (validatedData.items && validatedData.amount !== undefined && validatedData.total !== undefined) {
      const calculatedAmount = validatedData.items.reduce((sum, item) => sum + item.amount, 0);
      const calculatedTotal = calculatedAmount + (validatedData.tax || 0);

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
    }

    // Handle status changes
    const statusChanged = validatedData.status && validatedData.status !== existingInvoice.status;
    const updateData: any = {
      ...validatedData,
      ...(validatedData.dueDate && { dueDate: new Date(validatedData.dueDate) }),
      updatedAt: new Date()
    };

    // Handle payment status change
    if (validatedData.status === 'PAID' && existingInvoice.status !== 'PAID') {
      updateData.paidDate = validatedData.paidDate ? new Date(validatedData.paidDate) : new Date();
    } else if (validatedData.status !== 'PAID') {
      updateData.paidDate = null;
      updateData.paymentMethod = null;
      updateData.paymentReference = null;
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
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

    // Track analytics for status changes
    if (statusChanged) {
      await trackEvent(user.organizationId, 'invoice_status_changed', {
        invoiceId,
        oldStatus: existingInvoice.status,
        newStatus: validatedData.status,
        customerId: existingInvoice.customerId,
        amount: updatedInvoice.total
      });

      if (validatedData.status === 'PAID') {
        await trackEvent(user.organizationId, 'invoice_paid', {
          invoiceId,
          customerId: existingInvoice.customerId,
          amount: updatedInvoice.total,
          paymentMethod: validatedData.paymentMethod
        });

        // Emit payment event
        realtimeEvents.invoicePaid(user.organizationId, updatedInvoice);
      }
    }

    // Emit real-time event
    realtimeEvents.invoiceUpdated(user.organizationId, invoiceId, updatedInvoice);

    return NextResponse.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('Update invoice error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid invoice data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update invoice' },
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

    // Only admins and managers can delete invoices
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const invoiceId = params.id;

    // Check if invoice exists and belongs to organization
    const invoice = await prisma.invoice.findUnique({
      where: { 
        id: invoiceId,
        organizationId: user.organizationId
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Prevent deletion of paid invoices
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid invoices' },
        { status: 400 }
      );
    }

    // Soft delete by updating status
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { 
        status: 'CANCELLED',
        notes: `${invoice.notes || ''}\n\nCancelled by ${user.name} on ${new Date().toISOString()}`.trim()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice cancelled successfully'
    });

  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invoice' },
      { status: 500 }
    );
  }
}
