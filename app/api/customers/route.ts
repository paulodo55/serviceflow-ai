import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { realtimeEvents } from '@/lib/websocket';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  customerType: z.enum(['RESIDENTIAL', 'COMMERCIAL']).default('RESIDENTIAL'),
  source: z.enum(['WEBSITE', 'REFERRAL', 'GOOGLE', 'FACEBOOK', 'PHONE', 'OTHER']).default('OTHER'),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  preferences: z.object({
    communication: z.enum(['EMAIL', 'SMS', 'PHONE']).default('EMAIL'),
    appointmentReminders: z.boolean().default(true),
    marketingEmails: z.boolean().default(true)
  }).optional(),
  customFields: z.record(z.string(), z.any()).optional()
});

const updateCustomerSchema = createCustomerSchema.partial();

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
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const tags = searchParams.get('tags')?.split(',') || [];

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: user.organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(type && { customerType: type }),
      ...(status && { status }),
      ...(source && { source }),
      ...(tags.length > 0 && {
        tags: {
          hasSome: tags
        }
      })
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          appointments: {
            orderBy: { startTime: 'desc' },
            take: 3
          },
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 3
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 3
          },
          _count: {
            select: {
              appointments: true,
              invoices: true,
              messages: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    // Calculate customer stats
    const stats = await prisma.customer.groupBy({
      by: ['status'],
      where: { organizationId: user.organizationId },
      _count: { _all: true }
    });

    return NextResponse.json({
      customers,
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
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
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
    const validatedData = createCustomerSchema.parse(body);

    // Check for duplicate email/phone
    if (validatedData.email) {
      const existingByEmail = await prisma.customer.findFirst({
        where: {
          organizationId: user.organizationId,
          email: validatedData.email
        }
      });

      if (existingByEmail) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 409 }
        );
      }
    }

    if (validatedData.phone) {
      const existingByPhone = await prisma.customer.findFirst({
        where: {
          organizationId: user.organizationId,
          phone: validatedData.phone
        }
      });

      if (existingByPhone) {
        return NextResponse.json(
          { error: 'Customer with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        ...validatedData,
        organizationId: user.organizationId,
        status: 'ACTIVE',
        createdBy: user.id,
        preferences: validatedData.preferences || {
          communication: 'EMAIL',
          appointmentReminders: true,
          marketingEmails: true
        }
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

    // Track analytics
    await trackEvent(user.organizationId, 'customer_created', {
      customerId: customer.id,
      customerType: customer.customerType,
      source: customer.source
    });

    // Emit real-time event
    realtimeEvents.customerCreated(user.organizationId, customer);

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      customer
    }, { status: 201 });

  } catch (error) {
    console.error('Create customer error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
