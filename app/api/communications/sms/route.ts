// API endpoint for sending SMS messages
import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, sendBatchSMS, verifyPhoneNumber } from '@/lib/sms-service';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'send':
        return await handleSendSMS(data, session.user.id);
      
      case 'sendBatch':
        return await handleSendBatchSMS(data, session.user.id);
      
      case 'verify':
        return await handleVerifyPhone(data);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSendSMS(data: any, userId: string) {
  const { to, message, type = 'notification', customerId, appointmentId } = data;

  if (!to || !message) {
    return NextResponse.json(
      { error: 'Phone number and message are required' },
      { status: 400 }
    );
  }

  // Send SMS
  const result = await sendSMS({
    to,
    message,
    type
  });

  if (result.success) {
    // Store in database for tracking
    try {
      // Find customer by phone number to get organization
      const customer = await prisma.customer.findFirst({
        where: { phone: to }
      });
      
      if (customer) {
        await prisma.message.create({
          data: {
            organizationId: customer.organizationId,
            customerId: customer.id,
            content: message,
            channel: 'SMS',
            direction: 'OUTBOUND',
            status: 'SENT',
            twilioMessageId: result.messageId!,
            templateCategory: type,
            isAutomated: true
          }
        });
      }
    } catch (dbError) {
      console.error('Database error storing SMS:', dbError);
      // Continue even if DB fails
    }
  }

  return NextResponse.json({
    success: result.success,
    messageId: result.messageId,
    status: result.status,
    error: result.error
  });
}

async function handleSendBatchSMS(data: any, userId: string) {
  const { messages } = data;

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: 'Messages array is required' },
      { status: 400 }
    );
  }

  const result = await sendBatchSMS(messages);

  // Store successful sends in database
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const smsResult = result.results[i];

    if (smsResult.success) {
      try {
        // Find customer by phone number
        const customer = await prisma.customer.findFirst({
          where: { phone: message.to }
        });
        
        if (customer) {
          await prisma.message.create({
            data: {
              organizationId: customer.organizationId,
              customerId: customer.id,
              content: message.message,
              channel: 'SMS',
              direction: 'OUTBOUND',
              status: 'SENT',
              twilioMessageId: smsResult.messageId!,
              templateCategory: message.type || 'notification',
              isAutomated: true
            }
          });
        }
      } catch (dbError) {
        console.error('Database error storing batch SMS:', dbError);
      }
    }
  }

  return NextResponse.json({
    sent: result.sent,
    failed: result.failed,
    results: result.results
  });
}

async function handleVerifyPhone(data: any) {
  const { phoneNumber } = data;

  if (!phoneNumber) {
    return NextResponse.json(
      { error: 'Phone number is required' },
      { status: 400 }
    );
  }

  const result = await verifyPhoneNumber(phoneNumber);

  return NextResponse.json({
    valid: result.valid,
    formatted: result.formatted,
    error: result.error
  });
}

// GET endpoint for SMS history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');
    const appointmentId = url.searchParams.get('appointmentId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (appointmentId) where.appointmentId = appointmentId;

    // Build where clause for messages
    const messageWhere: any = {
      channel: 'SMS'
    };
    if (customerId) messageWhere.customerId = customerId;

    const smsHistory = await prisma.message.findMany({
      where: messageWhere,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    const total = await prisma.message.count({ where: messageWhere });

    return NextResponse.json({
      smsHistory,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit
      }
    });

  } catch (error) {
    console.error('SMS history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
