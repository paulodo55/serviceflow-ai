#!/usr/bin/env node

/**
 * SendGrid Setup Script
 * This script helps you configure SendGrid securely in your environment
 */

const fs = require('fs');
const path = require('path');

// Get SendGrid API key from environment or prompt user to set it
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'SG.YOUR_SENDGRID_API_KEY_HERE';

console.log('🚀 Setting up SendGrid for VervidFlow CRM...\n');

// Create .env.local file with SendGrid configuration
const envContent = `# ⚠️  CRITICAL: NEVER COMMIT THIS FILE TO GIT
# This file contains sensitive API keys and credentials

# SendGrid Email Service - CONFIGURED ✅
SENDGRID_API_KEY="${SENDGRID_API_KEY}"
SENDGRID_FROM_EMAIL="noreply@vervidflow.com"
SENDGRID_FROM_NAME="VervidFlow"

# Database (update with your actual database URL)
DATABASE_URL="your-database-url-here"

# NextAuth (update with your actual secret)
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Twilio SMS (add your credentials when ready)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Stripe (add your credentials when ready)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# Google OAuth (add your credentials when ready)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY="your-32-byte-encryption-key"
`;

try {
  // Write .env.local file
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Created .env.local with SendGrid configuration');
  
  // Verify .gitignore includes .env.local
  const gitignorePath = '.gitignore';
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('.env.local')) {
      console.log('⚠️  Adding .env.local to .gitignore for security');
      fs.appendFileSync(gitignorePath, '\n.env.local\n');
    }
    console.log('✅ .env.local is protected in .gitignore');
  }

  console.log('\n🎉 SendGrid Setup Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Visit: http://localhost:3000/app/test-email');
  console.log('3. Send a test email to verify integration');
  console.log('\n🔒 Security Notes:');
  console.log('- Your API key is stored in .env.local (never committed to git)');
  console.log('- Update other environment variables as needed');
  console.log('- For production, set environment variables in Vercel dashboard');
  
} catch (error) {
  console.error('❌ Error setting up SendGrid:', error.message);
  console.log('\n🔧 Manual Setup:');
  console.log('1. Create a .env.local file in your project root');
  console.log(`2. Add: SENDGRID_API_KEY="${SENDGRID_API_KEY}"`);
  console.log('3. Add: SENDGRID_FROM_EMAIL="noreply@vervidflow.com"');
  console.log('4. Add: SENDGRID_FROM_NAME="VervidFlow"');
}
