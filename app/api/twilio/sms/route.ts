// Twilio SMS webhook handler
import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/security';
import { handleOptOut, handleOptIn } from '@/lib/sms-service';
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
    const messageData = {
      messageSid: formData.get('MessageSid'),
      accountSid: formData.get('AccountSid'),
      from: formData.get('From'),
      to: formData.get('To'),
      body: formData.get('Body'),
      numMedia: formData.get('NumMedia'),
      mediaUrl: formData.get('MediaUrl0'),
      mediaContentType: formData.get('MediaContentType0'),
    };

    console.log('Received SMS:', messageData);

    // Handle opt-out/opt-in requests
    if (messageData.body) {
      const optedOut = await handleOptOut(messageData.from!, messageData.body);
      const optedIn = await handleOptIn(messageData.from!, messageData.body);
      
      if (optedOut || optedIn) {
        return NextResponse.json({ message: 'Processed opt request' });
      }
    }

    // Store incoming message in database
    try {
      // Find customer by phone number
      const customer = await prisma.customer.findFirst({
        where: { phone: messageData.from! }
      });
      
      if (customer) {
        await prisma.message.create({
          data: {
            organizationId: customer.organizationId,
            customerId: customer.id,
            content: messageData.body || '',
            channel: 'SMS',
            direction: 'INBOUND',
            status: 'DELIVERED',
            twilioMessageId: messageData.messageSid!,
            templateCategory: 'incoming'
          }
        });
      }
    } catch (dbError) {
      console.error('Database error storing SMS:', dbError);
      // Continue processing even if DB fails
    }

    // Auto-response logic based on message content
    let autoResponse = '';
    const messageBody = messageData.body?.toUpperCase() || '';

    if (messageBody.includes('HOURS') || messageBody.includes('OPEN')) {
      autoResponse = "We're open Monday-Friday 9AM-6PM, Saturday 10AM-4PM. Book online or call us!";
    } else if (messageBody.includes('BOOK') || messageBody.includes('APPOINTMENT')) {
      autoResponse = "To book an appointment, visit our website or call us. We'll get you scheduled right away!";
    } else if (messageBody.includes('PRICE') || messageBody.includes('COST')) {
      autoResponse = "For pricing information, please visit our website or speak with our team. We offer competitive rates!";
    } else if (messageBody.includes('CONFIRM')) {
      autoResponse = "Thank you for confirming! We've updated your appointment. See you soon!";
    } else if (messageBody.includes('RESCHEDULE') || messageBody.includes('CHANGE')) {
      autoResponse = "No problem! Please call us or visit our website to reschedule your appointment.";
    } else if (messageBody.includes('CANCEL')) {
      autoResponse = "We understand. Your appointment has been noted for cancellation. Please call to confirm.";
    } else {
      // Generic auto-response
      autoResponse = "Thanks for your message! We'll get back to you soon. For urgent matters, please call us.";
    }

    // Send auto-response (optional - can be disabled)
    if (process.env.TWILIO_AUTO_RESPONSE === 'true') {
      try {
        const { sendSMS } = await import('@/lib/sms-service');
        await sendSMS({
          to: messageData.from!,
          message: autoResponse,
          type: 'notification'
        });
      } catch (responseError) {
        console.error('Error sending auto-response:', responseError);
      }
    }

    return NextResponse.json({ 
      message: 'SMS processed successfully',
      autoResponse: process.env.TWILIO_AUTO_RESPONSE === 'true' ? autoResponse : null
    });

  } catch (error) {
    console.error('Twilio SMS webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Twilio SMS webhook endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}
