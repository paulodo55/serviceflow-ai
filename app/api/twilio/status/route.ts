// Twilio SMS status callback handler
import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/security';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-twilio-signature');
    
    // Verify Twilio signature for security
    if (process.env.NODE_ENV === 'production' && signature) {
      const isValid = validateTwilioSignature(body, signature);
      if (!isValid) {
        console.error('Invalid Twilio signature');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Parse form data from Twilio
    const formData = new URLSearchParams(body);
    const statusData = {
      messageSid: formData.get('MessageSid'),
      messageStatus: formData.get('MessageStatus'),
      to: formData.get('To'),
      from: formData.get('From'),
      errorCode: formData.get('ErrorCode'),
      errorMessage: formData.get('ErrorMessage'),
    };

    console.log('SMS Status Update:', statusData);

    // Update SMS status in database
    try {
      await prisma.message.updateMany({
        where: {
          twilioMessageId: statusData.messageSid!,
        },
        data: {
          status: mapTwilioStatus(statusData.messageStatus!),
        }
      });
    } catch (dbError) {
      console.error('Database error updating SMS status:', dbError);
    }

    // Handle failed messages
    if (statusData.messageStatus === 'failed' || statusData.messageStatus === 'undelivered') {
      console.error('SMS delivery failed:', {
        messageSid: statusData.messageSid,
        to: statusData.to,
        errorCode: statusData.errorCode,
        errorMessage: statusData.errorMessage,
      });

      // TODO: Implement retry logic or alert system admin
      // You might want to:
      // 1. Retry sending the message
      // 2. Try an alternative communication method (email)
      // 3. Alert the system administrator
      // 4. Update customer communication preferences
    }

    // Handle successful delivery
    if (statusData.messageStatus === 'delivered') {
      console.log('SMS delivered successfully:', statusData.messageSid);
      
      // TODO: Update analytics/metrics
      // You might want to:
      // 1. Update delivery metrics
      // 2. Track customer engagement
      // 3. Update campaign statistics
    }

    return NextResponse.json({ 
      message: 'Status updated successfully',
      status: statusData.messageStatus
    });

  } catch (error) {
    console.error('Twilio status webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Map Twilio status to our database enum
function mapTwilioStatus(twilioStatus: string): 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' {
  switch (twilioStatus.toLowerCase()) {
    case 'queued':
    case 'sending':
      return 'PENDING';
    case 'sent':
      return 'SENT';
    case 'delivered':
      return 'DELIVERED';
    case 'failed':
    case 'undelivered':
      return 'FAILED';
    default:
      return 'PENDING';
  }
}

// Handle GET requests (for webhook verification)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Twilio status webhook endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}
