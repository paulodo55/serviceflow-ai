export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface TemplateData {
  [key: string]: any;
}

// Template helper function
function renderTemplate(template: string, data: TemplateData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

export const emailTemplates = {
  // Welcome email for new users
  welcome: (data: {
    name: string;
    organizationName: string;
    plan: string;
    verificationUrl: string;
    trialEndsAt?: string;
  }): EmailTemplate => ({
    subject: 'Welcome to VervidFlow - Verify Your Email',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">Welcome to VervidFlow!</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hi {{name}}!</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Thank you for joining VervidFlow! We're excited to help you streamline your service business operations.
          </p>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            To get started, please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{verificationUrl}}" 
               style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #0369a1; margin-top: 0;">Your {{plan}} Plan Details:</h3>
          <ul style="color: #64748b; margin: 0; padding-left: 20px;">
            <li>Organization: {{organizationName}}</li>
            <li>Plan: {{plan}}</li>
            ${data.trialEndsAt ? '<li>Trial expires: {{trialEndsAt}}</li>' : '<li>Status: Active</li>'}
          </ul>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>Need help? Contact our support team at support@vervidflow.com</p>
          <p style="margin: 0;">© 2024 VervidFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Welcome to VervidFlow!

Hi {{name}}!

Thank you for joining VervidFlow! To get started, please verify your email address by visiting: {{verificationUrl}}

Your {{plan}} plan details:
- Organization: {{organizationName}}
- Plan: {{plan}}
${data.trialEndsAt ? '- Trial expires: {{trialEndsAt}}' : '- Status: Active'}

Need help? Contact support@vervidflow.com
© 2024 VervidFlow. All rights reserved.
    `
  }),

  // Password reset email
  passwordReset: (data: {
    name: string;
    resetUrl: string;
  }): EmailTemplate => ({
    subject: 'Reset Your VervidFlow Password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">Password Reset</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hi {{name}}!</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your VervidFlow account.
          </p>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" 
               style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            This link will expire in 1 hour for security reasons.
          </p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            If you didn't request this password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>Need help? Contact support@vervidflow.com</p>
          <p style="margin: 0;">© 2024 VervidFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Password Reset - VervidFlow

Hi {{name}}!

We received a request to reset your password. Click this link to create a new password: {{resetUrl}}

This link expires in 1 hour for security reasons.

If you didn't request this, you can safely ignore this email.

Need help? Contact support@vervidflow.com
© 2024 VervidFlow. All rights reserved.
    `
  }),

  // Appointment reminder email
  appointmentReminder: (data: {
    customerName: string;
    appointmentTitle: string;
    appointmentDate: string;
    appointmentTime: string;
    technician: string;
    location: string;
    duration: string;
    notes?: string;
  }): EmailTemplate => ({
    subject: 'Appointment Reminder - {{appointmentTitle}}',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">Appointment Reminder</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hi {{customerName}}!</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder about your upcoming appointment.
          </p>
          
          <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0277bd; margin-top: 0;">Appointment Details:</h3>
            <table style="width: 100%; color: #64748b;">
              <tr><td><strong>Service:</strong></td><td>{{appointmentTitle}}</td></tr>
              <tr><td><strong>Date:</strong></td><td>{{appointmentDate}}</td></tr>
              <tr><td><strong>Time:</strong></td><td>{{appointmentTime}}</td></tr>
              <tr><td><strong>Duration:</strong></td><td>{{duration}}</td></tr>
              <tr><td><strong>Technician:</strong></td><td>{{technician}}</td></tr>
              <tr><td><strong>Location:</strong></td><td>{{location}}</td></tr>
            </table>
          </div>
          
          ${data.notes ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;"><strong>Notes:</strong> {{notes}}</p>
          </div>
          ` : ''}
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Our technician will arrive at the scheduled time. Please ensure someone is available at the location.
          </p>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>Need to reschedule? Contact us at support@vervidflow.com</p>
          <p style="margin: 0;">© 2024 VervidFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Appointment Reminder

Hi {{customerName}}!

This is a reminder about your upcoming appointment:

Service: {{appointmentTitle}}
Date: {{appointmentDate}}
Time: {{appointmentTime}}
Duration: {{duration}}
Technician: {{technician}}
Location: {{location}}
${data.notes ? '\nNotes: {{notes}}' : ''}

Our technician will arrive at the scheduled time. Please ensure someone is available.

Need to reschedule? Contact support@vervidflow.com
© 2024 VervidFlow. All rights reserved.
    `
  }),

  // Appointment confirmation email
  appointmentConfirmation: (data: {
    customerName: string;
    appointmentTitle: string;
    appointmentDate: string;
    appointmentTime: string;
    technician: string;
    location: string;
    duration: string;
    notes?: string;
  }): EmailTemplate => ({
    subject: 'Appointment Confirmed - {{appointmentTitle}}',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10B981; margin: 0;">Appointment Confirmed!</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hi {{customerName}}!</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Your appointment has been confirmed. We look forward to serving you!
          </p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">Appointment Details:</h3>
            <table style="width: 100%; color: #064e3b;">
              <tr><td><strong>Service:</strong></td><td>{{appointmentTitle}}</td></tr>
              <tr><td><strong>Date:</strong></td><td>{{appointmentDate}}</td></tr>
              <tr><td><strong>Time:</strong></td><td>{{appointmentTime}}</td></tr>
              <tr><td><strong>Duration:</strong></td><td>{{duration}}</td></tr>
              <tr><td><strong>Technician:</strong></td><td>{{technician}}</td></tr>
              <tr><td><strong>Location:</strong></td><td>{{location}}</td></tr>
            </table>
          </div>
          
          ${data.notes ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;"><strong>Notes:</strong> {{notes}}</p>
          </div>
          ` : ''}
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            You'll receive a reminder 24 hours before your appointment.
          </p>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>Questions? Contact us at support@vervidflow.com</p>
          <p style="margin: 0;">© 2024 VervidFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Appointment Confirmed!

Hi {{customerName}}!

Your appointment has been confirmed:

Service: {{appointmentTitle}}
Date: {{appointmentDate}}
Time: {{appointmentTime}}
Duration: {{duration}}
Technician: {{technician}}
Location: {{location}}
${data.notes ? '\nNotes: {{notes}}' : ''}

You'll receive a reminder 24 hours before your appointment.

Questions? Contact support@vervidflow.com
© 2024 VervidFlow. All rights reserved.
    `
  }),

  // Invoice email
  invoice: (data: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    description: string;
    items: Array<{ description: string; quantity: number; rate: number; amount: number }>;
    paymentUrl?: string;
  }): EmailTemplate => ({
    subject: 'Invoice {{invoiceNumber}} - Payment Due',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">Invoice {{invoiceNumber}}</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hi {{customerName}}!</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Thank you for choosing our services. Please find your invoice details below:
          </p>
          
          <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0277bd; margin-top: 0;">Invoice Summary:</h3>
            <table style="width: 100%; color: #64748b;">
              <tr><td><strong>Invoice #:</strong></td><td>{{invoiceNumber}}</td></tr>
              <tr><td><strong>Description:</strong></td><td>{{description}}</td></tr>
              <tr><td><strong>Amount:</strong></td><td>${{amount}}</td></tr>
              <tr><td><strong>Due Date:</strong></td><td>{{dueDate}}</td></tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h4 style="color: #1e293b; margin-top: 0;">Service Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <th style="padding: 10px; text-align: left; color: #64748b;">Description</th>
                  <th style="padding: 10px; text-align: center; color: #64748b;">Qty</th>
                  <th style="padding: 10px; text-align: right; color: #64748b;">Rate</th>
                  <th style="padding: 10px; text-align: right; color: #64748b;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; color: #64748b;">${item.description}</td>
                  <td style="padding: 10px; text-align: center; color: #64748b;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; color: #64748b;">$${item.rate}</td>
                  <td style="padding: 10px; text-align: right; color: #64748b;">$${item.amount}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          ${data.paymentUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{paymentUrl}}" 
               style="background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Pay Now
            </a>
          </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>Questions about this invoice? Contact us at support@vervidflow.com</p>
          <p style="margin: 0;">© 2024 VervidFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Invoice {{invoiceNumber}}

Hi {{customerName}}!

Invoice Summary:
- Invoice #: {{invoiceNumber}}
- Description: {{description}}
- Amount: ${{amount}}
- Due Date: {{dueDate}}

Service Details:
${data.items.map(item => `${item.description} - Qty: ${item.quantity} - Rate: $${item.rate} - Amount: $${item.amount}`).join('\n')}

${data.paymentUrl ? 'Pay online: {{paymentUrl}}' : ''}

Questions? Contact support@vervidflow.com
© 2024 VervidFlow. All rights reserved.
    `
  })
};

// Render template with data
export function renderEmailTemplate(
  templateName: keyof typeof emailTemplates,
  data: TemplateData
): EmailTemplate {
  const template = emailTemplates[templateName](data);
  
  return {
    subject: renderTemplate(template.subject, data),
    html: renderTemplate(template.html, data),
    text: renderTemplate(template.text, data)
  };
}
