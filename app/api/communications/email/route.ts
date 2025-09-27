// API endpoint for sending emails
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendBatchEmails, createAppointmentReminderEmail } from '@/lib/email-service-enhanced';
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
        return await handleSendEmail(data, session.user.id);
      
      case 'sendBatch':
        return await handleSendBatchEmail(data, session.user.id);
      
      case 'sendReminder':
        return await handleSendReminder(data, session.user.id);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSendEmail(data: any, userId: string) {
  const { to, subject, html, text, customerId, appointmentId, type = 'notification' } = data;

  if (!to || !subject || (!html && !text)) {
    return NextResponse.json(
      { error: 'To, subject, and content (html or text) are required' },
      { status: 400 }
    );
  }

  // Send email
  const success = await sendEmail({
    to,
    subject,
    html: html || '',
    text: text || ''
  });

  if (success) {
    // Log email send in database (optional tracking)
    try {
      console.log(`Email sent successfully to ${to}: ${subject}`);
      // You could create an EmailLog model in your schema if you want to track emails
    } catch (error) {
      console.error('Email logging error:', error);
    }
  }

  return NextResponse.json({
    success,
    message: success ? 'Email sent successfully' : 'Failed to send email'
  });
}

async function handleSendBatchEmail(data: any, userId: string) {
  const { emails } = data;

  if (!emails || !Array.isArray(emails)) {
    return NextResponse.json(
      { error: 'Emails array is required' },
      { status: 400 }
    );
  }

  // Validate each email
  for (const email of emails) {
    if (!email.to || !email.subject || (!email.html && !email.text)) {
      return NextResponse.json(
        { error: 'Each email must have to, subject, and content' },
        { status: 400 }
      );
    }
  }

  const result = await sendBatchEmails(emails);

  return NextResponse.json({
    sent: result.sent,
    failed: result.failed,
    message: `Successfully sent ${result.sent} emails, ${result.failed} failed`
  });
}

async function handleSendReminder(data: any, userId: string) {
  const { appointmentId, customerId, customerName, customerEmail, appointmentDate, businessName } = data;

  if (!customerName || !customerEmail || !appointmentDate || !businessName) {
    return NextResponse.json(
      { error: 'Customer name, email, appointment date, and business name are required' },
      { status: 400 }
    );
  }

  // Create reminder email template
  const emailTemplate = createAppointmentReminderEmail(
    customerName,
    appointmentDate,
    businessName,
    customerEmail
  );

  // Send reminder email
  const success = await sendEmail(emailTemplate);

  if (success && appointmentId) {
    // Update appointment to mark reminder sent
    try {
        // Note: These fields don't exist in the current schema
        // await prisma.appointment.update({
        //   where: { id: appointmentId },
        //   data: {
        //     reminderSent: true,
        //     reminderSentAt: new Date()
        //   }
        // });
        console.log(`Reminder sent for appointment ${appointmentId}`);
    } catch (dbError) {
      console.error('Database error updating appointment:', dbError);
    }
  }

  return NextResponse.json({
    success,
    message: success ? 'Reminder email sent successfully' : 'Failed to send reminder email'
  });
}

// GET endpoint for email templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const templateType = url.searchParams.get('template');

    const templates = {
      welcome: {
        subject: 'Welcome to {businessName}!',
        html: `
          <h1>Welcome {customerName}!</h1>
          <p>Thank you for choosing {businessName}. We're excited to serve you!</p>
          <p>Your account is now active and you can:</p>
          <ul>
            <li>Book appointments online</li>
            <li>View your appointment history</li>
            <li>Manage your preferences</li>
          </ul>
          <p>If you have any questions, don't hesitate to contact us.</p>
          <p>Best regards,<br>{businessName} Team</p>
        `,
        variables: ['customerName', 'businessName']
      },
      appointmentConfirmation: {
        subject: 'Appointment Confirmed - {businessName}',
        html: `
          <h1>Appointment Confirmed!</h1>
          <p>Hi {customerName},</p>
          <p>Your appointment has been confirmed:</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <strong>Date & Time:</strong> {appointmentDate}<br>
            <strong>Service:</strong> {serviceName}<br>
            <strong>Location:</strong> {businessName}
          </div>
          <p>We'll send you a reminder 24 hours before your appointment.</p>
          <p>See you soon!</p>
        `,
        variables: ['customerName', 'businessName', 'appointmentDate', 'serviceName']
      },
      appointmentReminder: {
        subject: 'Appointment Reminder - {businessName}',
        html: `
          <h1>📅 Appointment Reminder</h1>
          <p>Hi {customerName}!</p>
          <p>This is a friendly reminder about your upcoming appointment:</p>
          <div style="background: #e3f2fd; padding: 20px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <strong>Date & Time:</strong> {appointmentDate}<br>
            <strong>Service:</strong> {serviceName}<br>
            <strong>Location:</strong> {businessName}
          </div>
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          <p>We look forward to seeing you!</p>
        `,
        variables: ['customerName', 'businessName', 'appointmentDate', 'serviceName']
      },
      paymentReceipt: {
        subject: 'Payment Receipt - {businessName}',
        html: `
          <h1>Payment Receipt</h1>
          <p>Hi {customerName},</p>
          <p>Thank you for your payment! Here are the details:</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <strong>Amount:</strong> $\${amount}<br>
            <strong>Date:</strong> {paymentDate}<br>
            <strong>Payment Method:</strong> {paymentMethod}<br>
            <strong>Transaction ID:</strong> {transactionId}
          </div>
          <p>This receipt serves as confirmation of your payment.</p>
          <p>Thank you for your business!</p>
        `,
        variables: ['customerName', 'businessName', 'amount', 'paymentDate', 'paymentMethod', 'transactionId']
      }
    };

    if (templateType && templates[templateType as keyof typeof templates]) {
      return NextResponse.json({
        template: templates[templateType as keyof typeof templates]
      });
    }

    return NextResponse.json({ templates });

  } catch (error) {
    console.error('Email templates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
