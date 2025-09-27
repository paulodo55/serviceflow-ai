import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pdfGenerator } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';

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

    // Get invoice with all related data
    const invoice = await prisma.invoice.findUnique({
      where: { 
        id: invoiceId,
        organizationId: user.organizationId
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        organization: {
          select: {
            name: true,
            settings: true
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Prepare data for PDF generation
    const pdfData = {
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        createdAt: invoice.createdAt,
        dueDate: invoice.dueDate,
        status: invoice.status,
        amount: invoice.amount,
        tax: invoice.tax,
        total: invoice.total,
        description: invoice.description,
        items: Array.isArray(invoice.items) ? invoice.items : [],
        notes: invoice.notes || undefined,
        terms: invoice.terms || undefined
      },
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email || undefined,
        phone: invoice.customer.phone || undefined,
        address: invoice.customer.address || undefined
      },
      organization: {
        name: invoice.organization.name,
        address: invoice.organization.settings?.address || undefined,
        phone: invoice.organization.settings?.phone || undefined,
        email: invoice.organization.settings?.email || undefined,
        website: invoice.organization.settings?.website || undefined
      }
    };

    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateInvoice(pdfData);

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
      }
    });

  } catch (error) {
    console.error('Invoice PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}
