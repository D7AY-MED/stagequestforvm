// Simple test script to verify the API endpoints
const http = require('http');

function makeJsonRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`[${method} /${path}] Status: ${res.statusCode}`);
        try {
          const parsedData = JSON.parse(responseData);
          console.log('Response:', JSON.stringify(parsedData, null, 2));
          resolve({ status: res.statusCode, body: parsedData });
        } catch (e) {
          console.log('Raw response:', responseData);
          resolve({ status: res.statusCode, body: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Error making request to ${path}:`, error.message);
      reject(error);
    });

    if (data) {
      const jsonData = JSON.stringify(data);
      req.write(jsonData);
    }

    req.end();
  });
}

async function runTests() {
  console.log('Running API endpoint tests...');
  
  // Test health endpoint
  try {
    await makeJsonRequest('GET', 'health');
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
  
  // Test registration with valid data
  try {
    const registrationData = {
      name: "Test User",
      company: "Test Company",
      email: "test@example.com", 
      password: "TestPass123!"
    };
    
    await makeJsonRequest('POST', 'register', registrationData);
  } catch (error) {
    console.error('Registration test failed:', error.message);
  }
  
  // Test registration with missing fields
  try {
    const badData = {
      name: "Test User",
      // Missing other fields
    };
    
    await makeJsonRequest('POST', 'register', badData);
  } catch (error) {
    console.error('Missing fields test failed:', error.message);
  }
  
  console.log('Tests completed.');
}

// Run the tests
runTests();
