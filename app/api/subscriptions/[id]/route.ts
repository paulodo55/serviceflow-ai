import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  type: z.enum(['SERVICE', 'PRODUCT', 'SOFTWARE', 'MEMBERSHIP', 'OTHER']).optional(),
  customerId: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive').optional(),
  billingCycle: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']).optional(),
  currency: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED', 'PENDING']).optional(),
  autoRenew: z.boolean().optional(),
  renewalTerms: z.number().optional(),
  alertDays: z.array(z.number()).optional(),
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
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        organizationId: user.organization.id,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        alerts: {
          orderBy: { scheduledFor: 'asc' },
        },
        contracts: {
          select: { id: true, title: true, status: true, createdAt: true },
        },
        _count: {
          select: { alerts: true, contracts: true },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateSubscriptionSchema.parse(body);

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        organizationId: user.organization.id,
      },
    });

    if (!existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Update next billing date if billing cycle changed
    let nextBillingDate = existingSubscription.nextBillingDate;
    if (validatedData.billingCycle && validatedData.billingCycle !== existingSubscription.billingCycle) {
      if (validatedData.billingCycle === 'ONE_TIME') {
        nextBillingDate = null;
      } else {
        nextBillingDate = new Date(validatedData.startDate || existingSubscription.startDate);
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
    }

    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        nextBillingDate,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        alerts: true,
      },
    });

    // Update alerts if alert days or end date changed
    if (validatedData.alertDays || validatedData.endDate) {
      await prisma.subscriptionAlert.deleteMany({
        where: {
          subscriptionId: params.id,
          status: 'PENDING',
        },
      });

      if (subscription.endDate) {
        const alertDays = validatedData.alertDays || existingSubscription.alertDays;
        const alertPromises = alertDays.map((days) => {
          const scheduledFor = new Date(subscription.endDate!);
          scheduledFor.setDate(scheduledFor.getDate() - days);

          if (scheduledFor > new Date()) {
            return prisma.subscriptionAlert.create({
              data: {
                subscriptionId: subscription.id,
                type: 'EXPIRATION',
                scheduledFor,
                subject: `Subscription Expiring in ${days} Days`,
                message: `Your subscription "${subscription.name}" will expire on ${subscription.endDate?.toLocaleDateString() || 'N/A'}.`,
                recipientEmail: subscription.customer?.email,
                recipientPhone: subscription.customer?.phone,
              },
            });
          }
          return null;
        });

        await Promise.all(alertPromises.filter(Boolean));
      }
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
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
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.id,
        organizationId: user.organization.id,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    await prisma.subscription.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
