import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addPaymentMethodSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  stripePaymentMethodId: z.string().min(1, 'Stripe payment method ID is required'),
  last4: z.string().length(4, 'Last 4 digits required'),
  brand: z.string().min(1, 'Card brand is required'),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
  billingName: z.string().optional(),
  billingAddress: z.record(z.any()).optional(),
  isDefault: z.boolean().default(false),
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
    const customerId = searchParams.get('customerId');
    const isActive = searchParams.get('isActive');

    const where: any = {
      organizationId: user.organization.id,
    };

    if (customerId) where.customerId = customerId;
    if (isActive !== null) where.isActive = isActive === 'true';

    const paymentMethods = await prisma.storedPaymentMethod.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
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
    const validatedData = addPaymentMethodSchema.parse(body);

    // Verify customer belongs to organization
    const customer = await prisma.customer.findFirst({
      where: {
        id: validatedData.customerId,
        organizationId: user.organization.id,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // If setting as default, unset other default payment methods
    if (validatedData.isDefault) {
      await prisma.storedPaymentMethod.updateMany({
        where: {
          customerId: validatedData.customerId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const paymentMethod = await prisma.storedPaymentMethod.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Send SMS confirmation if customer has phone number
    if (customer.phone) {
      await sendPaymentMethodConfirmation(paymentMethod.id, customer.phone);
    }

    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error) {
    console.error('Error adding payment method:', error);
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

async function sendPaymentMethodConfirmation(paymentMethodId: string, phoneNumber: string) {
  try {
    // Generate 6-digit confirmation code
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create SMS confirmation record
    const paymentMethod = await prisma.storedPaymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: { 
        customer: true,
        organization: true,
      },
    });

    if (!paymentMethod) return;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15-minute expiry

    const smsConfirmation = await prisma.sMSConfirmation.create({
      data: {
        organizationId: paymentMethod.organizationId,
        customerId: paymentMethod.customerId,
        phoneNumber,
        confirmationCode,
        purpose: 'PAYMENT_CONFIRMATION',
        expiresAt,
        relatedId: paymentMethodId,
        metadata: {
          paymentMethodId,
          last4: paymentMethod.last4,
          brand: paymentMethod.brand,
        },
      },
    });

    // Here you would integrate with SMS service (Twilio, etc.)
    // For demo purposes, we'll just log it
    console.log(`SMS Confirmation sent to ${phoneNumber}: Your payment method ending in ${paymentMethod.last4} has been added. Confirmation code: ${confirmationCode}`);

    return smsConfirmation;
  } catch (error) {
    console.error('Error sending payment method confirmation:', error);
  }
}
