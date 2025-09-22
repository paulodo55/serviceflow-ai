const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 Google Service Account Setup for ServiceFlow CRM');
console.log('================================================');
console.log('');
console.log('This script will help you add your Google Service Account JSON to your environment variables.');
console.log('');
console.log('⚠️  IMPORTANT: Never commit the JSON file to Git!');
console.log('');

rl.question('📁 Enter the full path to your downloaded JSON file: ', (jsonFilePath) => {
  if (!fs.existsSync(jsonFilePath)) {
    console.log('❌ File not found. Please check the path and try again.');
    rl.close();
    return;
  }

  try {
    // Read and validate JSON file
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const serviceAccount = JSON.parse(jsonContent);

    // Validate required fields
    if (!serviceAccount.client_email || !serviceAccount.private_key || !serviceAccount.project_id) {
      console.log('❌ Invalid service account file. Missing required fields.');
      rl.close();
      return;
    }

    console.log('✅ Valid service account file found!');
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Client Email: ${serviceAccount.client_email}`);
    console.log('');

    // Convert to single line for environment variable
    const singleLineJson = JSON.stringify(serviceAccount);

    // Create or update .env.local file
    const envPath = path.join(__dirname, '.env.local');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Remove existing GOOGLE_SERVICE_ACCOUNT_JSON if present
    const lines = envContent.split('\n').filter(line => 
      !line.startsWith('GOOGLE_SERVICE_ACCOUNT_JSON=')
    );

    // Add the new service account JSON
    lines.push(`GOOGLE_SERVICE_ACCOUNT_JSON=${singleLineJson}`);

    // Write back to .env.local
    fs.writeFileSync(envPath, lines.join('\n'));

    console.log('✅ Service account added to .env.local successfully!');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test the integration: http://localhost:3000/app/calendar');
    console.log('3. For production, add the same JSON to Vercel environment variables');
    console.log('');
    console.log('🚀 Your Google Calendar integration is now ready!');

    rl.close();

  } catch (error) {
    console.log('❌ Error reading or parsing JSON file:', error.message);
    rl.close();
  }
});
