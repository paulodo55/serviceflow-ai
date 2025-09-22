const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Google Service Account Setup');
console.log('======================================');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountJson) {
  console.log('❌ GOOGLE_SERVICE_ACCOUNT_JSON not found in environment variables');
  console.log('');
  console.log('💡 Make sure you:');
  console.log('1. Created .env.local file');
  console.log('2. Added your service account JSON');
  console.log('3. Saved the file');
  return;
}

if (serviceAccountJson === 'PASTE_YOUR_JSON_HERE') {
  console.log('❌ You need to replace PASTE_YOUR_JSON_HERE with your actual JSON');
  console.log('');
  console.log('💡 Steps:');
  console.log('1. Open .env.local file');
  console.log('2. Find GOOGLE_SERVICE_ACCOUNT_JSON=PASTE_YOUR_JSON_HERE');
  console.log('3. Replace PASTE_YOUR_JSON_HERE with your service account JSON');
  console.log('4. Save the file');
  return;
}

try {
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  console.log('✅ Service account JSON is valid!');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  console.log(`   Type: ${serviceAccount.type}`);
  
  // Check required fields
  const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    console.log('❌ Missing required fields:', missingFields.join(', '));
    return;
  }
  
  console.log('✅ All required fields present!');
  console.log('');
  console.log('🎉 SUCCESS! Your Google Service Account is properly configured');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('1. Start your server: npm run dev');
  console.log('2. Test calendar: http://localhost:3000/app/calendar');
  console.log('3. Create a test appointment');
  console.log('4. Verify it appears in Google Calendar');
  
} catch (error) {
  console.log('❌ Invalid JSON format:', error.message);
  console.log('');
  console.log('💡 Common issues:');
  console.log('- Make sure JSON is on ONE LINE (no line breaks)');
  console.log('- Check for missing quotes or commas');
  console.log('- Ensure you copied the complete JSON content');
}
