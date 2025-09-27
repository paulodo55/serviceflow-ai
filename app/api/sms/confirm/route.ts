import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const confirmSMSSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  confirmationCode: z.string().length(6, 'Confirmation code must be 6 digits'),
  purpose: z.enum(['PAYMENT_CONFIRMATION', 'ACCOUNT_VERIFICATION', 'TWO_FACTOR_AUTH', 'APPOINTMENT_REMINDER', 'MARKETING', 'SUPPORT']).optional(),
});

const sendSMSSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  purpose: z.enum(['PAYMENT_CONFIRMATION', 'ACCOUNT_VERIFICATION', 'TWO_FACTOR_AUTH', 'APPOINTMENT_REMINDER', 'MARKETING', 'SUPPORT']),
  relatedId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

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
    const action = body.action; // 'send' or 'confirm'

    if (action === 'confirm') {
      const validatedData = confirmSMSSchema.parse(body);

      // Find pending confirmation
      const confirmation = await prisma.sMSConfirmation.findFirst({
        where: {
          organizationId: user.organization.id,
          phoneNumber: validatedData.phoneNumber,
          confirmationCode: validatedData.confirmationCode,
          status: 'SENT',
          expiresAt: { gt: new Date() },
          ...(validatedData.purpose && { purpose: validatedData.purpose }),
        },
        include: {
          customer: true,
        },
      });

      if (!confirmation) {
        return NextResponse.json(
          { error: 'Invalid or expired confirmation code' },
          { status: 400 }
        );
      }

      // Check attempt limit
      if (confirmation.attempts >= confirmation.maxAttempts) {
        return NextResponse.json(
          { error: 'Maximum confirmation attempts exceeded' },
          { status: 429 }
        );
      }

      // Update confirmation as confirmed
      const updatedConfirmation = await prisma.sMSConfirmation.update({
        where: { id: confirmation.id },
        data: {
          status: 'DELIVERED',
          confirmedAt: new Date(),
          attempts: confirmation.attempts + 1,
        },
      });

      // Handle purpose-specific actions
      if (confirmation.purpose === 'PAYMENT_CONFIRMATION' && confirmation.relatedId) {
        // Confirm the payment method
        await prisma.storedPaymentMethod.update({
          where: { id: confirmation.relatedId },
          data: {
            isConfirmed: true,
            confirmedAt: new Date(),
          },
        });
      }

      return NextResponse.json({
        message: 'Confirmation successful',
        confirmation: updatedConfirmation,
      });

    } else if (action === 'send') {
      const validatedData = sendSMSSchema.parse(body);

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

      // Generate confirmation code
      const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration based on purpose
      const expiresAt = new Date();
      switch (validatedData.purpose) {
        case 'TWO_FACTOR_AUTH':
          expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes
          break;
        case 'PAYMENT_CONFIRMATION':
          expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes
          break;
        default:
          expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour
      }

      // Create SMS confirmation
      const confirmation = await prisma.sMSConfirmation.create({
        data: {
          organizationId: user.organization.id,
          customerId: validatedData.customerId,
          phoneNumber: validatedData.phoneNumber,
          confirmationCode,
          purpose: validatedData.purpose,
          expiresAt,
          relatedId: validatedData.relatedId,
          metadata: validatedData.metadata,
        },
        include: {
          customer: true,
        },
      });

      // Send SMS (integrate with actual SMS service)
      const messageContent = generateSMSContent(validatedData.purpose, confirmationCode, user.organization.name);
      
      // Here you would integrate with SMS service like Twilio
      console.log(`SMS sent to ${validatedData.phoneNumber}: ${messageContent}`);

      return NextResponse.json({
        message: 'SMS confirmation sent successfully',
        confirmationId: confirmation.id,
        expiresAt: confirmation.expiresAt,
      }, { status: 201 });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error handling SMS confirmation:', error);
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
    const purpose = searchParams.get('purpose');
    const status = searchParams.get('status');

    const where: any = {
      organizationId: user.organization.id,
    };

    if (customerId) where.customerId = customerId;
    if (purpose) where.purpose = purpose;
    if (status) where.status = status;

    const confirmations = await prisma.sMSConfirmation.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit results
    });

    return NextResponse.json({ confirmations });
  } catch (error) {
    console.error('Error fetching SMS confirmations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSMSContent(purpose: string, code: string, organizationName: string): string {
  switch (purpose) {
    case 'PAYMENT_CONFIRMATION':
      return `${organizationName}: Your payment method has been added. Confirmation code: ${code}. Reply STOP to opt out.`;
    case 'ACCOUNT_VERIFICATION':
      return `${organizationName}: Verify your account with code: ${code}. Reply STOP to opt out.`;
    case 'TWO_FACTOR_AUTH':
      return `${organizationName}: Your verification code is: ${code}. Do not share this code.`;
    case 'APPOINTMENT_REMINDER':
      return `${organizationName}: Appointment reminder. Confirmation code: ${code}. Reply STOP to opt out.`;
    default:
      return `${organizationName}: Your confirmation code is: ${code}. Reply STOP to opt out.`;
  }
}
