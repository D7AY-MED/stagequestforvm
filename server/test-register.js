// Simple script to test the register endpoint directly
const axios = require('axios');

async function testRegistration() {
  try {
    const payload = {
      name: 'Test User 2',
      company: 'Test Company 2',
      email: 'test2@example.com',
      password: 'TestPassword123!'
    };
    
    console.log('Sending test registration...');  
    console.log('Payload:', payload);
    
    const response = await axios.post('http://localhost:3000/api/register', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Registration failed!');
    console.error('Error details:', error.response ? error.response.data : error.message);
    console.error('Request payload:', {
      name: 'Test User 2',
      company: 'Test Company 2',
      email: 'test2@example.com',
      password: 'TestPassword123!'
    });
    if (error.response) {
      console.error('Status code:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testRegistration();
