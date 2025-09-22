const fs = require('fs');
const path = require('path');

// Create .env.local file with required environment variables
const envContent = `# ServiceFlow Environment Variables
NEXTAUTH_SECRET="serviceflow-super-secret-jwt-key-for-development-only-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
NEXTAUTH_DEBUG="true"
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file successfully');
  console.log('📝 Environment variables configured:');
  console.log('   - NEXTAUTH_SECRET: Set');
  console.log('   - NEXTAUTH_URL: http://localhost:3000');
  console.log('   - NEXTAUTH_DEBUG: Enabled');
  console.log('');
  console.log('🔐 You can now test login with:');
  console.log('   Email: odopaul55@gmail.com');
  console.log('   Password: verviddemo123');
  console.log('');
  console.log('🚀 Run: npm run dev');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
}
