#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating your .env.local with Stripe keys...\n');

const envLocalPath = path.join(__dirname, '.env.local');

// Read existing .env.local or create new content
let envContent = '';
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ Found existing .env.local file');
} else {
  console.log('📝 Creating new .env.local file');
}

// Function to update or add environment variable
function updateOrAddEnvVar(content, key, placeholder) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    console.log(`✏️  Updating existing ${key}`);
    return content.replace(regex, `${key}="${placeholder}"`);
  } else {
    console.log(`➕ Adding new ${key}`);
    return content + `\n${key}="${placeholder}"`;
  }
}

// Add/update Stripe keys
envContent = updateOrAddEnvVar(envContent, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_YOUR_PUBLISHABLE_KEY_HERE');
envContent = updateOrAddEnvVar(envContent, 'STRIPE_SECRET_KEY', 'sk_test_YOUR_SECRET_KEY_HERE');

// Add other required variables if they don't exist
envContent = updateOrAddEnvVar(envContent, 'NEXTAUTH_URL', 'http://localhost:3000');
envContent = updateOrAddEnvVar(envContent, 'NEXTAUTH_SECRET', 'REPLACE_WITH_32_CHAR_SECRET');
envContent = updateOrAddEnvVar(envContent, 'DATABASE_URL', 'postgresql://username:password@host:5432/database');

// Write the updated content
fs.writeFileSync(envLocalPath, envContent.trim() + '\n');

console.log('\n✅ Updated .env.local file!');
console.log('\n🔑 NOW DO THIS:');
console.log('1. Open .env.local in your editor');
console.log('2. Replace "pk_test_YOUR_PUBLISHABLE_KEY_HERE" with your actual publishable key');
console.log('3. Replace "sk_test_YOUR_SECRET_KEY_HERE" with your actual secret key');
console.log('4. Generate NextAuth secret with: openssl rand -base64 32');
console.log('\n💡 Your keys should look like:');
console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51ABC123..."');
console.log('   STRIPE_SECRET_KEY="sk_test_51DEF456..."');
