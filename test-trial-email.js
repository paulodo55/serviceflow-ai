#!/usr/bin/env node

// Test script for trial signup email functionality
const fetch = require('node-fetch');

async function testTrialSignup() {
  console.log('🧪 Testing Trial Signup Email Workflow...\n');

  const testData = {
    fullName: 'Test User',
    email: 'test@example.com',
    companyName: 'Test Company',
    phoneNumber: '+1234567890'
  };

  try {
    console.log('📝 Submitting trial signup with data:', testData);
    
    const response = await fetch('http://localhost:3000/api/trial-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Trial signup successful!');
      console.log('📧 Email should be sent with demo credentials:');
      console.log('   Demo Email: demo@vervidai.com');
      console.log('   Demo Password: Demo123');
      console.log('\n📊 Response:', result);
    } else {
      console.log('❌ Trial signup failed:', result);
    }
  } catch (error) {
    console.error('🚨 Error testing trial signup:', error.message);
  }
}

// Run the test
testTrialSignup();
