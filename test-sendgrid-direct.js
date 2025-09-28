#!/usr/bin/env node

/**
 * Direct SendGrid Test Script
 * Tests SendGrid API integration without Next.js server
 */

require('dotenv').config({ path: '.env.local' });
const sgMail = require('@sendgrid/mail');

console.log('🧪 Testing SendGrid Integration Directly...\n');

// Check if API key is configured
if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY not found in .env.local');
  console.log('Please run: node setup-sendgrid.js');
  process.exit(1);
}

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Test email configuration
const testEmail = {
  to: 'test@example.com', // Change this to your email to actually receive the test
  from: {
    email: process.env.SENDGRID_FROM_EMAIL || 'noreply@vervidflow.com',
    name: process.env.SENDGRID_FROM_NAME || 'VervidFlow'
  },
  subject: '✅ SendGrid Integration Test - Success!',
  html: `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3B82F6; margin: 0;">🎉 SendGrid Test Successful!</h1>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #1e293b; margin-top: 0;">Integration Working!</h2>
        <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
          Your SendGrid integration is working correctly! This email was sent directly from your VervidFlow CRM system.
        </p>
        
        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0277bd; margin-top: 0;">✅ Test Results:</h3>
          <ul style="color: #64748b; margin: 0; padding-left: 20px;">
            <li>SendGrid API: ✅ Connected</li>
            <li>Email Service: ✅ Active</li>
            <li>Template System: ✅ Working</li>
            <li>Direct Send: ✅ Successful</li>
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
SendGrid Integration Test - Success!

Your SendGrid integration is working correctly! This email was sent directly from your VervidFlow CRM system.

✅ Test Results:
- SendGrid API: Connected
- Email Service: Active
- Template System: Working
- Direct Send: Successful

Sent from VervidFlow CRM Platform
© 2024 VervidFlow. All rights reserved.
  `
};

console.log('📧 Sending test email...');
console.log(`To: ${testEmail.to}`);
console.log(`From: ${testEmail.from.email}`);
console.log(`Subject: ${testEmail.subject}\n`);

// Send the email
sgMail
  .send(testEmail)
  .then((response) => {
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log(`Status Code: ${response[0].statusCode}`);
    console.log(`Message ID: ${response[0].headers['x-message-id']}`);
    console.log('\n🎉 SendGrid Integration is working perfectly!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your email inbox for the test message');
    console.log('2. Your SendGrid integration is ready for production');
    console.log('3. Deploy to Vercel with environment variables set');
  })
  .catch((error) => {
    console.error('❌ SENDGRID ERROR:');
    console.error(error.response ? error.response.body : error.message);
    
    if (error.response && error.response.body && error.response.body.errors) {
      console.log('\n🔍 Detailed Error Information:');
      error.response.body.errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.message}`);
        if (err.field) console.log(`   Field: ${err.field}`);
        if (err.help) console.log(`   Help: ${err.help}`);
      });
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your SendGrid API key is correct');
    console.log('2. Check that your sender email is verified in SendGrid');
    console.log('3. Ensure your SendGrid account is active');
    console.log('4. Check SendGrid dashboard for any account issues');
  });
