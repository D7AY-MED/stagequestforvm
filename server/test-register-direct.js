/**
 * Direct test script to verify the registration API endpoint
 * Run with: node test-register-direct.js
 */

const http = require('http');

// Test data
const testData = {
  name: "Test User Direct",
  company: "Test Company Direct",
  email: "testdirect@example.com", 
  password: "TestDirect123!"
};

// Convert the data to JSON string
const jsonData = JSON.stringify(testData);

// Request options
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(jsonData)
  }
};

console.log('Sending test registration request to http://localhost:3000/api/register');
console.log('Request payload:', testData);

// Create and send the request
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  // Collect response data
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // Process complete response
  res.on('end', () => {
    console.log('Response received');
    
    try {
      const parsedData = JSON.parse(data);
      console.log('Parsed response:');
      console.log(JSON.stringify(parsedData, null, 2));
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('Registration successful!');
      } else {
        console.log('Registration failed with status:', res.statusCode);
      }
    } catch (e) {
      console.error('Error parsing response JSON:', e.message);
      console.log('Raw response:', data);
    }
  });
});

// Handle request errors
req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(jsonData);
req.end();

console.log('Request sent, waiting for response...');
