import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { pdfGenerator } from '@/lib/pdf-generator';
import { generateReport, calculateAnalytics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const generateReportSchema = z.object({
  type: z.enum(['revenue', 'appointments', 'customers', 'performance', 'analytics']),
  format: z.enum(['PDF', 'JSON', 'CSV']).default('PDF'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  includeCharts: z.boolean().default(true),
  includeDetails: z.boolean().default(false)
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

    // Only admins and managers can generate reports
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = generateReportSchema.parse(body);

    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    // Get organization info
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { name: true, settings: true }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    let reportData;

    // Generate report based on type
    switch (validatedData.type) {
      case 'analytics':
        reportData = await generateAnalyticsReport(user.organizationId, startDate, endDate);
        break;
      default:
        reportData = await generateReport(user.organizationId, validatedData.type, startDate, endDate);
    }

    // Format response based on requested format
    switch (validatedData.format) {
      case 'PDF':
        const pdfBuffer = await generatePDFReport(
          validatedData.type,
          reportData,
          organization,
          startDate,
          endDate,
          validatedData.includeCharts
        );

        return new NextResponse(pdfBuffer as any, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${validatedData.type}-report-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.pdf"`
          }
        });

      case 'CSV':
        const csvData = convertToCSV(reportData, validatedData.type);
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${validatedData.type}-report-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.csv"`
          }
        });

      case 'JSON':
      default:
        return NextResponse.json({
          success: true,
          report: {
            type: validatedData.type,
            format: validatedData.format,
            generatedAt: new Date(),
            dateRange: { startDate, endDate },
            organization: organization.name,
            data: reportData
          }
        });
    }

  } catch (error) {
    console.error('Report generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid report parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateAnalyticsReport(organizationId: string, startDate: Date, endDate: Date) {
  const analytics = await calculateAnalytics(organizationId);
  
  // Get detailed metrics for the date range
  const [
    appointmentsByStatus,
    revenueByMonth,
    customersBySource,
    topServices
  ] = await Promise.all([
    prisma.appointment.groupBy({
      by: ['status'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { _all: true }
    }),
    prisma.invoice.groupBy({
      by: ['createdAt'],
      where: {
        organizationId,
        status: 'PAID',
        paidDate: { gte: startDate, lte: endDate }
      },
      _sum: { total: true }
    }),
    prisma.customer.groupBy({
      by: ['source'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { _all: true }
    }),
    prisma.appointment.groupBy({
      by: ['type'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { _all: true },
      _sum: { price: true }
    })
  ]);

  return {
    summary: analytics,
    details: {
      appointmentsByStatus,
      revenueByMonth,
      customersBySource,
      topServices
    }
  };
}

async function generatePDFReport(
  type: string,
  data: any,
  organization: any,
  startDate: Date,
  endDate: Date,
  includeCharts: boolean
) {
  const reportData = {
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
    subtitle: `Business Analytics Report`,
    dateRange: { startDate, endDate },
    organization: {
      name: organization.name,
      address: organization.settings?.address || ''
    },
    sections: formatReportSections(type, data, includeCharts)
  };

  return await pdfGenerator.generateReport(reportData as any);
}

function formatReportSections(type: string, data: any, includeCharts: boolean) {
  const sections = [];

  switch (type) {
    case 'analytics':
      sections.push({
        title: 'Executive Summary',
        type: 'text',
        data: `This report provides a comprehensive overview of business performance metrics for the specified period. Key highlights include revenue trends, customer acquisition, and operational efficiency indicators.`
      });

      sections.push({
        title: 'Revenue Summary',
        type: 'table',
        data: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Revenue', `$${data.summary.revenue.total.toFixed(2)}`],
            ['This Month', `$${data.summary.revenue.thisMonth.toFixed(2)}`],
            ['Last Month', `$${data.summary.revenue.lastMonth.toFixed(2)}`],
            ['Growth Rate', `${data.summary.revenue.growth.toFixed(1)}%`]
          ]
        }
      });

      sections.push({
        title: 'Appointment Metrics',
        type: 'table',
        data: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Appointments', data.summary.appointments.total.toString()],
            ['Completed', data.summary.appointments.completed.toString()],
            ['Cancelled', data.summary.appointments.cancelled.toString()],
            ['Completion Rate', `${data.summary.appointments.completionRate.toFixed(1)}%`]
          ]
        }
      });

      sections.push({
        title: 'Customer Metrics',
        type: 'table',
        data: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Customers', data.summary.customers.total.toString()],
            ['Active Customers', data.summary.customers.active.toString()],
            ['New Customers', data.summary.customers.new.toString()],
            ['Retention Rate', `${data.summary.customers.retention.toFixed(1)}%`]
          ]
        }
      });
      break;

    case 'revenue':
      sections.push({
        title: 'Revenue Details',
        type: 'table',
        data: {
          headers: ['Date', 'Invoice #', 'Customer', 'Amount'],
          rows: data.map((invoice: any) => [
            new Date(invoice.paidDate).toLocaleDateString(),
            invoice.invoiceNumber,
            invoice.customer?.name || 'N/A',
            `$${invoice.total.toFixed(2)}`
          ])
        }
      });
      break;

    case 'appointments':
      sections.push({
        title: 'Appointment Details',
        type: 'table',
        data: {
          headers: ['Date', 'Customer', 'Service', 'Status', 'Revenue'],
          rows: data.map((appointment: any) => [
            new Date(appointment.startTime).toLocaleDateString(),
            appointment.customer?.name || 'N/A',
            appointment.title,
            appointment.status,
            appointment.price ? `$${appointment.price.toFixed(2)}` : 'N/A'
          ])
        }
      });
      break;

    case 'customers':
      sections.push({
        title: 'Customer Details',
        type: 'table',
        data: {
          headers: ['Name', 'Email', 'Phone', 'Total Spent', 'Last Appointment'],
          rows: data.map((customer: any) => [
            customer.name,
            customer.email || 'N/A',
            customer.phone || 'N/A',
            `$${customer.invoices.reduce((sum: number, inv: any) => sum + (inv.status === 'PAID' ? inv.total : 0), 0).toFixed(2)}`,
            customer.appointments[0] ? new Date(customer.appointments[0].startTime).toLocaleDateString() : 'N/A'
          ])
        }
      });
      break;

    default:
      sections.push({
        title: 'Report Data',
        type: 'text',
        data: JSON.stringify(data, null, 2)
      });
  }

  return sections;
}

function convertToCSV(data: any, type: string): string {
  let csv = '';

  switch (type) {
    case 'revenue':
      csv = 'Date,Invoice Number,Customer,Amount,Status\n';
      data.forEach((invoice: any) => {
        csv += `${new Date(invoice.paidDate).toLocaleDateString()},"${invoice.invoiceNumber}","${invoice.customer?.name || 'N/A'}",${invoice.total},"${invoice.status}"\n`;
      });
      break;

    case 'appointments':
      csv = 'Date,Customer,Service,Status,Duration,Revenue\n';
      data.forEach((appointment: any) => {
        csv += `${new Date(appointment.startTime).toLocaleDateString()},"${appointment.customer?.name || 'N/A'}","${appointment.title}","${appointment.status}",${appointment.estimatedDuration},${appointment.price || 0}\n`;
      });
      break;

    case 'customers':
      csv = 'Name,Email,Phone,Total Spent,Appointments,Last Contact\n';
      data.forEach((customer: any) => {
        const totalSpent = customer.invoices.reduce((sum: number, inv: any) => sum + (inv.status === 'PAID' ? inv.total : 0), 0);
        csv += `"${customer.name}","${customer.email || ''}","${customer.phone || ''}",${totalSpent},${customer.appointments.length},"${customer.appointments[0] ? new Date(customer.appointments[0].startTime).toLocaleDateString() : ''}"\n`;
      });
      break;

    default:
      csv = 'Data\n';
      csv += JSON.stringify(data);
  }

  return csv;
}
