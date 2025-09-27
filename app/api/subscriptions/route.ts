import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['SERVICE', 'PRODUCT', 'SOFTWARE', 'MEMBERSHIP', 'OTHER']),
  customerId: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  billingCycle: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']),
  currency: z.string().default('USD'),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  autoRenew: z.boolean().default(true),
  renewalTerms: z.number().default(12),
  alertDays: z.array(z.number()).default([30, 15, 7]),
});

const updateSubscriptionSchema = createSubscriptionSchema.partial();

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
    const type = searchParams.get('type');
    const customerId = searchParams.get('customerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organization.id,
    };

    if (status) where.status = status;
    if (type) where.type = type;
    if (customerId) where.customerId = customerId;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          alerts: {
            where: { status: 'PENDING' },
            orderBy: { scheduledFor: 'asc' },
          },
          _count: {
            select: { alerts: true, contracts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
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
    const validatedData = createSubscriptionSchema.parse(body);

    // Calculate next billing date based on billing cycle
    let nextBillingDate: Date | undefined;
    if (validatedData.billingCycle !== 'ONE_TIME') {
      nextBillingDate = new Date(validatedData.startDate);
      switch (validatedData.billingCycle) {
        case 'DAILY':
          nextBillingDate.setDate(nextBillingDate.getDate() + 1);
          break;
        case 'WEEKLY':
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          break;
        case 'MONTHLY':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case 'YEARLY':
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }
    }

    const subscription = await prisma.subscription.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
        nextBillingDate,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        alerts: true,
      },
    });

    // Create initial alerts if subscription has an end date
    if (subscription.endDate) {
      const alertPromises = validatedData.alertDays.map((days) => {
        const scheduledFor = new Date(subscription.endDate!);
        scheduledFor.setDate(scheduledFor.getDate() - days);

        if (scheduledFor > new Date()) {
          return prisma.subscriptionAlert.create({
            data: {
              subscriptionId: subscription.id,
              type: 'EXPIRATION',
              scheduledFor,
              subject: `Subscription Expiring in ${days} Days`,
              message: `Your subscription "${subscription.name}" will expire on ${subscription.endDate.toLocaleDateString()}.`,
              recipientEmail: subscription.customer?.email,
              recipientPhone: subscription.customer?.phone,
            },
          });
        }
        return null;
      });

      await Promise.all(alertPromises.filter(Boolean));
    }

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
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
