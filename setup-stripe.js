#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 ServiceFlow Stripe Setup Script');
console.log('=====================================\n');

const envLocalPath = path.join(__dirname, '.env.local');

// Read existing .env.local if it exists
let existingEnv = '';
if (fs.existsSync(envLocalPath)) {
  existingEnv = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ Found existing .env.local file\n');
} else {
  console.log('📝 Creating new .env.local file\n');
}

// Function to update or add environment variable
function updateEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}="${value}"`);
  } else {
    return content + `\n${key}="${value}"`;
  }
}

console.log('🚀 STEP-BY-STEP STRIPE SETUP:');
console.log('\n1. Go to: https://dashboard.stripe.com/apikeys');
console.log('2. Copy your Publishable Key (pk_test_...)');
console.log('3. Copy your Secret Key (sk_test_...)');
console.log('\n4. Go to: https://dashboard.stripe.com/products');
console.log('5. Create these products:');
console.log('   - ServiceFlow Basic: $29/month');
console.log('   - ServiceFlow Professional: $79/month');
console.log('   - ServiceFlow Enterprise: $149/month');
console.log('6. Copy each Price ID (price_...)');

console.log('\n📋 ADD THESE TO YOUR .env.local:');
console.log('=====================================');

const requiredEnvVars = `
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY_HERE"
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"

# Stripe Price IDs (from your products)
STRIPE_BASIC_PRICE_ID="price_YOUR_BASIC_PRICE_ID"
STRIPE_PRO_PRICE_ID="price_YOUR_PRO_PRICE_ID"
STRIPE_ENTERPRISE_PRICE_ID="price_YOUR_ENTERPRISE_PRICE_ID"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_32_CHAR_SECRET_HERE"

# Database (get from Railway, Supabase, etc.)
DATABASE_URL="postgresql://username:password@host:5432/database"
`;

console.log(requiredEnvVars);

// Create a template file
const templatePath = path.join(__dirname, '.env.template');
fs.writeFileSync(templatePath, requiredEnvVars.trim());

console.log('\n✅ Created .env.template file');
console.log('📝 Copy the template to .env.local and fill in your values');

console.log('\n🔧 NEXT STEPS:');
console.log('1. Copy .env.template to .env.local');
console.log('2. Fill in your Stripe keys and Price IDs');
console.log('3. Run: npm run dev');
console.log('4. Visit: http://localhost:3000/pricing-new');
console.log('5. Test the subscription flow!');

console.log('\n💡 Need help? Check ENV_SETUP.md for detailed instructions');
