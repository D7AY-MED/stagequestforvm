// Simple script to test the API directly

const fetch = require('node-fetch');

async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');
    
    const testData = {
      name: 'Test User',
      company: 'Test Company',
      email: 'test@example.com',
      password: 'TestPassword123!'
    };
    
    console.log('Sending data:', testData);
    const payload = JSON.stringify(testData);
    console.log('Stringified payload:', payload);
    
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      body: payload
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Response data:', data);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      console.log('Raw response text:', responseText);
    }
    
    if (!response.ok) {
      console.error('Registration failed:', data?.error || 'Unknown error');
    } else {
      console.log('Registration successful!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the test
testRegistration();
