import { NextRequest, NextResponse } from 'next/server';
import emailService from '@/lib/email-service-enhanced';

// Alternative contact endpoint that sends directly to your iCloud email
// Use this if Cloudflare email routing isn't working
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Create email template sent directly to your iCloud email
    const contactNotification = {
      to: 'odopaul55@icloud.com', // Direct to your iCloud email
      subject: `🚨 URGENT: Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Contact Form Submission - VervidFlow</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #374151; margin-bottom: 5px; display: block; }
            .value { background-color: #f1f5f9; padding: 12px; border-radius: 6px; border-left: 4px solid #6366f1; }
            .message-content { background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap; }
            .urgent { background-color: #fee2e2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🚨 New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">From VervidFlow.com - DIRECT DELIVERY</p>
            </div>
            <div class="content">
              <div class="urgent">
                <h3 style="margin: 0 0 10px 0; color: #dc2626;">⚡ DIRECT EMAIL - BYPASSING CLOUDFLARE</h3>
                <p style="margin: 0; color: #dc2626;">This email was sent directly to odopaul55@icloud.com to ensure delivery.</p>
              </div>
              
              <div class="field">
                <span class="label">Name:</span>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <span class="label">Email:</span>
                <div class="value">${email}</div>
              </div>
              
              ${company ? `
              <div class="field">
                <span class="label">Company:</span>
                <div class="value">${company}</div>
              </div>
              ` : ''}
              
              <div class="field">
                <span class="label">Message:</span>
                <div class="message-content">${message}</div>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #dbeafe;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af;">📞 Quick Actions:</h3>
                <p style="margin: 0; color: #1e40af;">
                  <strong>Reply to:</strong> <a href="mailto:${email}">${email}</a><br>
                  <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                  <strong>Source:</strong> VervidFlow Contact Form
                </p>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent directly from the VervidFlow contact form</p>
              <p>Submitted on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🚨 URGENT: New Contact Form Submission from VervidFlow.com

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}

Message:
${message}

Reply to: ${email}
Submitted: ${new Date().toLocaleString()}

This email was sent directly to odopaul55@icloud.com to bypass Cloudflare routing issues.
      `
    };

    // Create auto-reply for the customer
    const autoReply = {
      to: email,
      subject: 'Thank you for contacting VervidFlow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Thank you for contacting VervidFlow</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
            .logo { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
            .content { padding: 40px 20px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #1e293b; color: #cbd5e1; padding: 30px 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">VervidFlow</div>
              <p style="margin: 0; opacity: 0.9;">Smart CRM for Service Businesses</p>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Hi ${name},</h2>
              
              <p>Thank you for reaching out to us! We've received your message and will get back to you within 24 hours.</p>
              
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #374151;">Your Message:</h3>
                <p style="margin: 0; color: #6b7280; white-space: pre-wrap;">${message}</p>
              </div>
              
              <p>In the meantime, feel free to explore our platform:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://vervidflow.com/demo" class="cta-button" style="color: white; text-decoration: none;">Try Our Demo</a>
              </div>
              
              <p>If you have any urgent questions, you can reach us at:</p>
              <ul>
                <li><strong>Email:</strong> hello@vervidflow.com</li>
                <li><strong>Phone:</strong> (214) 973-3761</li>
              </ul>
            </div>
            <div class="footer">
              <p><strong>VervidFlow by Vervid</strong></p>
              <p>Smart CRM & Scheduling Platform for Service Businesses</p>
              <p style="margin-top: 20px; opacity: 0.8;">
                <a href="https://vervidflow.com" style="color: #60a5fa;">vervidflow.com</a> | 
                <a href="mailto:hello@vervidflow.com" style="color: #60a5fa;">hello@vervidflow.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${name},

Thank you for reaching out to us! We've received your message and will get back to you within 24 hours.

Your Message:
${message}

In the meantime, feel free to explore our platform at https://vervidflow.com/demo

If you have any urgent questions, you can reach us at:
- Email: hello@vervidflow.com  
- Phone: (214) 973-3761

Best regards,
The VervidFlow Team

VervidFlow by Vervid
Smart CRM & Scheduling Platform for Service Businesses
https://vervidflow.com
      `
    };

    // Send both emails
    console.log('🚨 DIRECT EMAIL: Sending contact form emails directly to odopaul55@icloud.com');
    
    const [notificationSent, autoReplySent] = await Promise.all([
      emailService.sendEmail(contactNotification),
      emailService.sendEmail(autoReply)
    ]);

    if (notificationSent) {
      console.log(`✅ DIRECT: Contact form notification sent successfully to odopaul55@icloud.com`);
      console.log(`📧 From: ${name} (${email})`);
    } else {
      console.error('❌ DIRECT: Failed to send contact form notification');
    }

    if (autoReplySent) {
      console.log(`✅ Auto-reply sent successfully to: ${email}`);
    } else {
      console.error('❌ Failed to send auto-reply');
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.',
      notificationSent,
      autoReplySent,
      deliveryMethod: 'direct-to-icloud'
    });

  } catch (error) {
    console.error('Direct contact form API error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
