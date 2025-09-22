const fs = require('fs');
const path = require('path');

console.log('🔑 ServiceFlow - Google Service Account Setup');
console.log('===========================================');
console.log('');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found existing .env.local file');
} else {
  console.log('📝 Creating new .env.local file');
}

console.log('');
console.log('📋 INSTRUCTIONS:');
console.log('1. Open your downloaded Google Service Account JSON file');
console.log('2. Copy the ENTIRE content (all the JSON)');
console.log('3. Paste it below when prompted');
console.log('4. Press Enter twice when done');
console.log('');
console.log('⚠️  IMPORTANT: Make sure to copy the complete JSON starting with { and ending with }');
console.log('');

// Simple way to get multi-line input
console.log('📋 Paste your Google Service Account JSON here:');
console.log('(Press Ctrl+D when finished on Mac/Linux, or Ctrl+Z then Enter on Windows)');
console.log('');

let jsonInput = '';
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  let chunk = process.stdin.read();
  if (chunk !== null) {
    jsonInput += chunk;
  }
});

process.stdin.on('end', () => {
  try {
    // Clean up the input
    const cleanJson = jsonInput.trim();
    
    if (!cleanJson.startsWith('{') || !cleanJson.endsWith('}')) {
      console.log('❌ Invalid JSON format. Make sure you copied the complete JSON content.');
      return;
    }

    // Validate JSON
    const serviceAccount = JSON.parse(cleanJson);
    
    if (!serviceAccount.client_email || !serviceAccount.private_key || !serviceAccount.project_id) {
      console.log('❌ Missing required fields in service account JSON.');
      return;
    }

    console.log('✅ Valid service account JSON detected!');
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Client Email: ${serviceAccount.client_email}`);

    // Convert to single line for environment variable
    const singleLineJson = JSON.stringify(serviceAccount);

    // Update .env.local
    const lines = envContent.split('\n').filter(line => 
      !line.startsWith('GOOGLE_SERVICE_ACCOUNT_JSON=')
    );

    lines.push(`GOOGLE_SERVICE_ACCOUNT_JSON=${singleLineJson}`);
    
    // Remove empty lines at the end and add one final newline
    const finalContent = lines.filter(line => line.trim() !== '').join('\n') + '\n';
    
    fs.writeFileSync(envPath, finalContent);

    console.log('');
    console.log('🎉 SUCCESS! Google Service Account added to .env.local');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Test calendar: http://localhost:3000/app/calendar');
    console.log('3. For production: Add same JSON to Vercel environment variables');
    console.log('');
    console.log('🚀 Your Google Calendar integration is ready!');

  } catch (error) {
    console.log('❌ Error processing JSON:', error.message);
    console.log('');
    console.log('💡 Tips:');
    console.log('- Make sure you copied the complete JSON content');
    console.log('- JSON should start with { and end with }');
    console.log('- Check for any missing quotes or commas');
  }
});
