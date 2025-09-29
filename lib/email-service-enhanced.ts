// Enhanced Email service for VervidFlow with Twilio SendGrid integration
import { EmailTemplate, WelcomeEmailData, PasswordResetData } from '@/types';

// Email templates (keeping existing ones)
export const createWelcomeEmail = (data: WelcomeEmailData): EmailTemplate => {
  const { fullName, email, companyName, tempPassword } = data;
  const loginUrl = 'https://vervidflow.com/login';
  const supportEmail = 'hello@vervidflow.com';
  const supportPhone = '(214) 973-3761';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to VervidFlow</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
            .logo { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
            .tagline { font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 20px; }
            .credentials { background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature { text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px; }
            .feature-icon { font-size: 24px; margin-bottom: 10px; }
            .footer { background-color: #1e293b; color: #cbd5e1; padding: 30px 20px; text-align: center; }
            .footer a { color: #6366f1; text-decoration: none; }
            @media (max-width: 600px) { .features { grid-template-columns: 1fr; } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">VervidFlow</div>
                <div class="tagline">by Vervid</div>
            </div>
            
            <div class="content">
                <h1>Welcome to VervidFlow, ${fullName}! 🎉</h1>
                
                <p>Your 14-day free trial is now active! We're excited to help <strong>${companyName}</strong> streamline your CRM experience with our AI-powered automation platform.</p>
                
                <div class="credentials">
                    <h3>🔐 Your Demo Login Credentials</h3>
                    <p><strong>Demo Email:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-weight: bold;">demo@vervidai.com</code></p>
                    <p><strong>Demo Password:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Demo123</code></p>
                    <p style="font-size: 14px; color: #64748b; margin-top: 15px;">
                        <em>💡 Use these credentials to explore the full CRM with sample data. Your personal account with ${email} will be set up shortly.</em>
                    </p>
                </div>
                
                <div style="text-align: center;">
                    <a href="${loginUrl}" class="cta-button">Access Your Dashboard</a>
                </div>
                
                <h3>🚀 What You Can Do With VervidFlow:</h3>
                <div class="features">
                    <div class="feature">
                        <div class="feature-icon">📅</div>
                        <h4>Instant Booking</h4>
                        <p>24/7 online scheduling</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🤖</div>
                        <h4>AI Automation</h4>
                        <p>Smart customer interactions</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📊</div>
                        <h4>Real-time Analytics</h4>
                        <p>Performance insights</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🔔</div>
                        <h4>Smart Reminders</h4>
                        <p>Automated notifications</p>
                    </div>
                </div>
                
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h4 style="color: #92400e; margin-top: 0;">⏰ Trial Information</h4>
                    <p style="color: #92400e; margin-bottom: 0;">
                        Your trial expires on <strong>${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>. 
                        No credit card required during the trial period.
                    </p>
                </div>
                
                <h3>Need Help Getting Started?</h3>
                <p>Our team is here to help you succeed:</p>
                <ul>
                    <li>📧 Email us: <a href="mailto:${supportEmail}">${supportEmail}</a></li>
                    <li>📞 Call us: <a href="tel:${supportPhone}">${supportPhone}</a></li>
                    <li>🎥 <a href="${loginUrl}">Watch our demo</a> to see VervidFlow in action</li>
                </ul>
            </div>
            
            <div class="footer">
                <p><strong>VervidFlow by Vervid</strong></p>
                <p>Streamlining CRM experiences with AI-powered automation</p>
                <p>
                    <a href="https://vervidflow.com">Website</a> | 
                    <a href="https://vervidflow.com/support">Support</a> | 
                    <a href="https://vervidflow.com/privacy">Privacy</a>
                </p>
                <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                    This email was sent to ${email}. If you didn't sign up for VervidFlow, please ignore this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to VervidFlow, ${fullName}!

    Your 14-day free trial is now active for ${companyName}.

    Demo Login Credentials:
    Demo Email: demo@vervidai.com
    Demo Password: Demo123
    
    Use these credentials to explore the full CRM with sample data. Your personal account with ${email} will be set up shortly.

    Access your dashboard: ${loginUrl}

    Your trial expires on ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}.

    Need help? Contact us:
    Email: ${supportEmail}
    Phone: ${supportPhone}

    Best regards,
    The Vervid Team
  `;

  return {
    to: email,
    subject: `Welcome to VervidFlow - Your Trial Account is Ready! 🚀`,
    html,
    text,
  };
};

export const createPasswordResetEmail = (data: PasswordResetData): EmailTemplate => {
  const { fullName, email, resetToken } = data;
  const resetUrl = `https://vervidflow.com/reset-password?token=${resetToken}`;
  const supportEmail = 'hello@vervidflow.com';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your VervidFlow Password</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 20px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .warning { background-color: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background-color: #1e293b; color: #cbd5e1; padding: 30px 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>VervidFlow</h1>
                <p>by Vervid</p>
            </div>
            
            <div class="content">
                <h2>Reset Your Password</h2>
                
                <p>Hi ${fullName},</p>
                
                <p>We received a request to reset your VervidFlow password. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="cta-button">Reset Password</a>
                </div>
                
                <div class="warning">
                    <h4 style="color: #dc2626; margin-top: 0;">⚠️ Security Notice</h4>
                    <ul style="color: #dc2626; margin-bottom: 0;">
                        <li>This link expires in 1 hour for your security</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password won't change until you create a new one</li>
                    </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
                
                <p>Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            </div>
            
            <div class="footer">
                <p>VervidFlow by Vervid</p>
                <p style="font-size: 12px; color: #64748b;">
                    This email was sent to ${email}. If you didn't request a password reset, please ignore this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Reset Your VervidFlow Password

    Hi ${fullName},

    We received a request to reset your password. Click this link to create a new password:
    ${resetUrl}

    This link expires in 1 hour for your security.

    If you didn't request this reset, please ignore this email.

    Need help? Contact us at ${supportEmail}

    Best regards,
    The Vervid Team
  `;

  return {
    to: email,
    subject: 'Reset Your VervidFlow Password',
    html,
    text,
  };
};

// Enhanced email sending function with Twilio SendGrid
export const sendEmail = async (template: EmailTemplate): Promise<boolean> => {
  try {
    // Log email for development/debugging
    console.log('=== EMAIL SENDING ===');
    console.log(`To: ${template.to}`);
    console.log(`Subject: ${template.subject}`);
    console.log('=== END EMAIL LOG ===');

    // Check if we have SendGrid API key
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Falling back to SMTP...');
      return await sendEmailSMTP(template);
    }

    // Import SendGrid dynamically
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: template.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'hello@vervidflow.com',
        name: process.env.SENDGRID_FROM_NAME || 'VervidFlow by Vervid'
      },
      subject: template.subject,
      text: template.text,
      html: template.html,
      trackingSettings: {
        clickTracking: {
          enable: true,
        },
        openTracking: {
          enable: true,
        },
      },
      categories: ['vervidflow', 'transactional'],
      customArgs: {
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
      },
    };

    const response = await sgMail.default.send(msg);
    console.log('Email sent successfully via SendGrid:', response[0].statusCode);
    return true;

  } catch (error: any) {
    console.error('SendGrid email sending error:', error);
    
    // If SendGrid fails, try SMTP fallback
    if (error.code && error.code >= 400) {
      console.log('Attempting SMTP fallback...');
      return await sendEmailSMTP(template);
    }
    
    // Fallback: Log email content for manual sending
    if (process.env.NODE_ENV === 'development') {
      console.log('=== EMAIL CONTENT FOR MANUAL SENDING ===');
      console.log(`To: ${template.to}`);
      console.log(`Subject: ${template.subject}`);
      console.log('Text Content:');
      console.log(template.text);
      console.log('=== END EMAIL CONTENT ===');
    }
    
    return false;
  }
};

// SMTP fallback function
const sendEmailSMTP = async (template: EmailTemplate): Promise<boolean> => {
  try {
    // Check if we have SMTP credentials
    if (!process.env.SMTP_PASSWORD || !process.env.SMTP_USER) {
      console.warn('SMTP credentials not configured. Email will not be sent.');
      console.log('Please set SMTP_USER and SMTP_PASSWORD environment variables.');
      return false;
    }

    // Import nodemailer dynamically to avoid build issues
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mail.me.com', // iCloud SMTP
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER || 'hello@vervidflow.com',
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"VervidFlow by Vervid" <${process.env.SMTP_USER || 'hello@vervidflow.com'}>`,
      to: template.to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    console.log('Email sent successfully via SMTP:', info.messageId);
    return true;

  } catch (error) {
    console.error('SMTP email sending error:', error);
    return false;
  }
};

// Batch email sending for notifications
export const sendBatchEmails = async (templates: EmailTemplate[]): Promise<{ sent: number; failed: number }> => {
  let sent = 0;
  let failed = 0;

  for (const template of templates) {
    const success = await sendEmail(template);
    if (success) {
      sent++;
    } else {
      failed++;
    }
    
    // Add delay between emails to avoid rate limiting
    if (templates.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { sent, failed };
};

// Email template for appointment reminders
export const createAppointmentReminderEmail = (customerName: string, appointmentDate: string, businessName: string, customerEmail: string): EmailTemplate => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Reminder</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .appointment-details { background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
            .footer { background-color: #1e293b; color: #cbd5e1; padding: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 Appointment Reminder</h1>
                <p>${businessName}</p>
            </div>
            
            <div class="content">
                <h2>Hi ${customerName}!</h2>
                
                <p>This is a friendly reminder about your upcoming appointment.</p>
                
                <div class="appointment-details">
                    <h3>📋 Appointment Details</h3>
                    <p><strong>Date & Time:</strong> ${appointmentDate}</p>
                    <p><strong>Business:</strong> ${businessName}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" class="cta-button">Confirm Appointment</a>
                    <a href="#" class="cta-button" style="background: #64748b;">Reschedule</a>
                </div>
                
                <p>If you need to make any changes or have questions, please contact us as soon as possible.</p>
                
                <p>We look forward to seeing you!</p>
            </div>
            
            <div class="footer">
                <p><strong>${businessName}</strong></p>
                <p>Powered by VervidFlow</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Appointment Reminder - ${businessName}

    Hi ${customerName}!

    This is a friendly reminder about your upcoming appointment.

    Date & Time: ${appointmentDate}
    Business: ${businessName}

    If you need to make any changes or have questions, please contact us as soon as possible.

    We look forward to seeing you!

    Best regards,
    ${businessName}
    Powered by VervidFlow
  `;

  return {
    to: customerEmail,
    subject: `Appointment Reminder - ${businessName}`,
    html,
    text,
  };
};

const emailService = {
  sendEmail,
  sendBatchEmails,
  createWelcomeEmail,
  createPasswordResetEmail,
  createAppointmentReminderEmail
};

export default emailService;
