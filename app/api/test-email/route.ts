import { NextRequest, NextResponse } from 'next/server';
import emailService from '@/lib/email-service-enhanced';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;

    // Validate input
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
    }

    // Send test email using SendGrid
    const success = await emailService.sendEmail({
      to,
      subject: subject || 'Test Email from VervidFlow',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">🎉 SendGrid Integration Test</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">Test Email Successful!</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              ${message}
            </p>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              This email was sent using SendGrid API integration with your VervidFlow CRM platform.
            </p>
            
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0277bd; margin-top: 0;">✅ Integration Status:</h3>
              <ul style="color: #64748b; margin: 0; padding-left: 20px;">
                <li>SendGrid API: ✅ Connected</li>
                <li>Email Service: ✅ Active</li>
                <li>Template System: ✅ Working</li>
                <li>Delivery Status: ✅ Sent Successfully</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; color: #64748b; font-size: 14px;">
            <p>Sent from VervidFlow CRM Platform</p>
            <p style="margin: 0;">© 2024 VervidFlow. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
Test Email from VervidFlow CRM

${message}

This email was sent using SendGrid API integration with your VervidFlow CRM platform.

✅ Integration Status:
- SendGrid API: Connected
- Email Service: Active  
- Template System: Working
- Delivery Status: Sent Successfully

Sent from VervidFlow CRM Platform
© 2024 VervidFlow. All rights reserved.
      `
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully via SendGrid!',
        details: {
          provider: 'SendGrid',
          to,
          subject,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SendGrid Email Test Endpoint',
    usage: 'POST with { "to": "email@example.com", "subject": "Test", "message": "Hello World" }',
    status: 'Ready'
  });
}