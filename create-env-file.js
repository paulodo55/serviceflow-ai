const fs = require('fs');
const path = require('path');

console.log('🔧 Creating .env.local file for ServiceFlow CRM');
console.log('===============================================');

const envContent = `# ServiceFlow Environment Variables

# NextAuth.js Configuration (REQUIRED FOR LOGIN)
NEXTAUTH_SECRET="serviceflow-super-secret-jwt-key-for-development-only-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"

# Development Mode
NODE_ENV="development"
NEXTAUTH_DEBUG="true"

# Google Service Account JSON (REQUIRED FOR CALENDAR)
# Replace PASTE_YOUR_JSON_HERE with your actual service account JSON
# Make sure it's all on ONE LINE with no line breaks
# Example: GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}
GOOGLE_SERVICE_ACCOUNT_JSON=PASTE_YOUR_JSON_HERE
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Open .env.local file in your text editor');
  console.log('2. Replace PASTE_YOUR_JSON_HERE with your Google Service Account JSON');
  console.log('3. Make sure the JSON is on ONE LINE (no line breaks)');
  console.log('4. Save the file');
  console.log('5. Run: npm run dev');
  console.log('');
  console.log('🚨 IMPORTANT:');
  console.log('- Never commit .env.local to Git');
  console.log('- Keep your service account JSON secure');
  console.log('- The JSON should be one continuous line');
} catch (error) {
  console.log('❌ Error creating .env.local file:', error.message);
}
