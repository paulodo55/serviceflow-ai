import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createExportSchema = z.object({
  exportType: z.enum(['FULL_BACKUP', 'CUSTOMERS', 'APPOINTMENTS', 'INVOICES', 'MESSAGES', 'ANALYTICS', 'CUSTOM']),
  format: z.enum(['CSV', 'JSON', 'XML', 'PDF', 'EXCEL']).default('CSV'),
  dateFrom: z.string().transform((str) => new Date(str)).optional(),
  dateTo: z.string().transform((str) => new Date(str)).optional(),
  includeDeleted: z.boolean().default(false),
  dataTypes: z.array(z.string()).default([]),
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
    const status = searchParams.get('status');
    const exportType = searchParams.get('exportType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organization.id,
    };

    // Users can only see their own export requests unless they're admin
    if (user.role === 'STAFF') {
      where.requestedBy = user.id;
    }

    if (status) where.status = status;
    if (exportType) where.exportType = exportType;

    const [exports, total] = await Promise.all([
      prisma.dataExportRequest.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dataExportRequest.count({ where }),
    ]);

    return NextResponse.json({
      exports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching data exports:', error);
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

    const body = await request.json();
    const validatedData = createExportSchema.parse(body);

    // Create export request
    const exportRequest = await prisma.dataExportRequest.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
        requestedBy: user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Start export process in background
    processDataExport(exportRequest.id);

    return NextResponse.json(exportRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating data export:', error);
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

async function processDataExport(exportId: string) {
  try {
    // Update status to processing
    await prisma.dataExportRequest.update({
      where: { id: exportId },
      data: { 
        status: 'PROCESSING',
        processedAt: new Date(),
      },
    });

    const exportRequest = await prisma.dataExportRequest.findUnique({
      where: { id: exportId },
      include: { organization: true, user: true },
    });

    if (!exportRequest) return;

    // Simulate data export processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    let recordCount = 0;
    let fileSize = 0;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Generate export data based on type
    switch (exportRequest.exportType) {
      case 'CUSTOMERS':
        const customers = await prisma.customer.findMany({
          where: { 
            organizationId: exportRequest.organizationId,
            ...(exportRequest.dateFrom && exportRequest.dateTo && {
              createdAt: {
                gte: exportRequest.dateFrom,
                lte: exportRequest.dateTo,
              },
            }),
          },
        });
        recordCount = customers.length;
        fileSize = JSON.stringify(customers).length;
        break;

      case 'APPOINTMENTS':
        const appointments = await prisma.appointment.findMany({
          where: { 
            organizationId: exportRequest.organizationId,
            ...(exportRequest.dateFrom && exportRequest.dateTo && {
              startTime: {
                gte: exportRequest.dateFrom,
                lte: exportRequest.dateTo,
              },
            }),
          },
          include: { customer: true, service: true },
        });
        recordCount = appointments.length;
        fileSize = JSON.stringify(appointments).length;
        break;

      case 'INVOICES':
        const invoices = await prisma.invoice.findMany({
          where: { 
            organizationId: exportRequest.organizationId,
            ...(exportRequest.dateFrom && exportRequest.dateTo && {
              createdAt: {
                gte: exportRequest.dateFrom,
                lte: exportRequest.dateTo,
              },
            }),
          },
          include: { customer: true, appointment: true },
        });
        recordCount = invoices.length;
        fileSize = JSON.stringify(invoices).length;
        break;

      case 'MESSAGES':
        const messages = await prisma.message.findMany({
          where: { 
            organizationId: exportRequest.organizationId,
            ...(exportRequest.dateFrom && exportRequest.dateTo && {
              sentAt: {
                gte: exportRequest.dateFrom,
                lte: exportRequest.dateTo,
              },
            }),
          },
          include: { customer: true },
        });
        recordCount = messages.length;
        fileSize = JSON.stringify(messages).length;
        break;

      case 'FULL_BACKUP':
        // For full backup, we'd export all data
        recordCount = 1000; // Mock count
        fileSize = 1024 * 1024 * 5; // 5MB mock size
        break;

      default:
        recordCount = 0;
        fileSize = 0;
    }

    // Generate download URL (in production, this would be a signed URL to cloud storage)
    const downloadUrl = `${baseUrl}/api/data/download/${exportId}`;
    
    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update export request as completed
    await prisma.dataExportRequest.update({
      where: { id: exportId },
      data: {
        status: 'COMPLETED',
        downloadUrl,
        expiresAt,
        recordCount,
        fileSize,
      },
    });

    console.log(`Data export ${exportId} completed successfully`);
  } catch (error) {
    console.error('Error processing data export:', error);
    
    // Update status to failed
    await prisma.dataExportRequest.update({
      where: { id: exportId },
      data: { 
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    });
  }
}
