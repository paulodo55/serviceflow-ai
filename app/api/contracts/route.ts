import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createContractSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  customerId: z.string().optional(),
  subscriptionId: z.string().optional(),
  templateId: z.string().optional(),
  requiresSignature: z.boolean().default(true),
  effectiveDate: z.string().transform((str) => new Date(str)).optional(),
  expirationDate: z.string().transform((str) => new Date(str)).optional(),
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
    const customerId = searchParams.get('customerId');
    const templateId = searchParams.get('templateId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organization.id,
    };

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (templateId) where.templateId = templateId;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          subscription: {
            select: { id: true, name: true, type: true, status: true },
          },
          template: {
            select: { id: true, name: true, category: true },
          },
          versions: {
            select: { id: true, version: true, createdAt: true, createdBy: true },
            orderBy: { version: 'desc' },
            take: 1,
          },
          _count: {
            select: { versions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
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
    const validatedData = createContractSchema.parse(body);

    // If using a template, populate content from template
    let content = validatedData.content;
    if (validatedData.templateId) {
      const template = await prisma.contractTemplate.findFirst({
        where: {
          id: validatedData.templateId,
          organizationId: user.organization.id,
        },
      });

      if (template) {
        content = template.content;
        
        // Replace template variables if any
        if (template.variables && validatedData.customerId) {
          const customer = await prisma.customer.findFirst({
            where: {
              id: validatedData.customerId,
              organizationId: user.organization.id,
            },
          });

          if (customer) {
            content = content
              .replace(/\{\{customer\.name\}\}/g, customer.name || '')
              .replace(/\{\{customer\.email\}\}/g, customer.email || '')
              .replace(/\{\{customer\.phone\}\}/g, customer.phone || '')
              .replace(/\{\{customer\.address\}\}/g, customer.address || '')
              .replace(/\{\{organization\.name\}\}/g, user.organization.name || '')
              .replace(/\{\{today\}\}/g, new Date().toLocaleDateString());
          }
        }
      }
    }

    const contract = await prisma.contract.create({
      data: {
        ...validatedData,
        content,
        organizationId: user.organization.id,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        subscription: {
          select: { id: true, name: true, type: true, status: true },
        },
        template: {
          select: { id: true, name: true, category: true },
        },
      },
    });

    // Create initial version
    await prisma.contractVersion.create({
      data: {
        contractId: contract.id,
        version: 1,
        content: contract.content,
        changes: 'Initial version',
        createdBy: user.id,
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
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
