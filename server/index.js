const express = require('express');
const cors = require('cors');
const app = express();

// Explicitly require axios and our Azure B2C service
let axios;
let azureB2CService;

try {
  axios = require('axios');
  console.log('Axios loaded successfully');
  
  try {
    azureB2CService = require('./azureB2CService');
    console.log('Azure B2C Service loaded successfully');
  } catch (serviceError) {
    console.error('Failed to load Azure B2C Service:', serviceError.message);
  }
} catch (error) {
  console.error('Error loading axios:', error.message);
  // Provide a mock axios for development fallback
  axios = {
    post: async () => ({ data: { access_token: 'mock-token' } }),
    get: async () => ({ data: { value: [] } })
  };
  console.log('Using mock axios implementation');
}

// Enable CORS with more permissive configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON requests with more detailed error handling
app.use(express.json({
  limit: '1mb',
  strict: false, // Be more lenient with JSON parsing
  reviver: (key, value) => {
    // For debugging, log keys and values being parsed
    // console.log(`Parsing JSON key: "${key}", value type: ${typeof value}`);
    return value;
  }
}));

// Also support form URL encoded data
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request headers:', req.headers);
    
    // Clone the body for inspection, in case streaming was already started
    const bodyClone = { ...req.body };
    console.log('Request body:', bodyClone);
    
    // Add raw body capture for debugging
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
    });
    
    req.on('end', () => {
      if (rawBody && (!req.body || Object.keys(req.body).length === 0)) {
        console.log('Raw body captured:', rawBody);
        try {
          const parsedBody = JSON.parse(rawBody);
          console.log('Parsed raw body:', parsedBody);
          
          // If original body is empty but raw parsing worked, use the raw parsed data
          if (Object.keys(req.body || {}).length === 0) {
            req.body = parsedBody;
            console.log('Updated request body from raw data');
          }
        } catch (e) {
          console.log('Not valid JSON in raw body');
        }
      }
    });
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'StageQuest API server is running',
    endpoints: ['/api/health', '/api/verify-student', '/api/verify-recruiter', '/api/register', '/api/login']
  });
});

// Verify student endpoint
app.get('/api/verify-student', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // For testing, accept any token
  res.status(200).json({
    name: 'Test Student',
    email: 'student@example.com',
    university: 'Test University',
    major: 'Computer Science'
  });
});

// Verify recruiter endpoint
app.get('/api/verify-recruiter', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // For testing, accept any token
  res.status(200).json({
    name: 'Test Recruiter',
    email: 'recruiter@example.com',
    company: 'Test Company',
    role: 'recruiter'
  });
});

// Register endpoint with comprehensive debugging
app.post('/api/register', async (req, res) => {
  console.log('--------------- REGISTRATION REQUEST ---------------');
  console.log('Registration request received at', new Date().toISOString());
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('Body content:', req.body);
  
  // Save raw request data for debugging
  let rawBody = '';
  
  // If the body has already been parsed as an object, stringify it
  if (req.body && typeof req.body === 'object') {
    try {
      rawBody = JSON.stringify(req.body);
    } catch (e) {
      console.error('Error stringifying body object:', e);
    }
  }
  
  // Also try to collect any unparsed raw data
  let collectedRawBody = '';
  req.on('data', chunk => {
    collectedRawBody += chunk.toString();
  });
  
  req.on('end', async () => {
    if (collectedRawBody) {
      console.log('Collected raw body:', collectedRawBody);
    }
    
    try {
      // Start with req.body, then try alternatives if it's empty
      let userData = req.body;
      
      // If body is empty, try alternatives
      if (!userData || typeof userData !== 'object' || Object.keys(userData).length === 0) {
        console.warn('Request body is empty or invalid, trying alternatives');
        
        // Try parsing collected raw body if available
        if (collectedRawBody) {
          try {
            userData = JSON.parse(collectedRawBody);
            console.log('Successfully parsed collected raw body:', userData);
          } catch (e) {
            console.error('Failed to parse collected raw body:', e.message);
          }
        }
        
        // If still empty, try URL query parameters
        if (!userData || Object.keys(userData).length === 0) {
          userData = req.query;
          console.log('Using URL query parameters:', userData);
        }
      }
      
      // Last resort: create an empty object
      if (!userData) {
        userData = {};
      }
      
      console.log('Final user data for processing:', userData);
      
      // Extract fields with fallbacks for common field naming variations
      const name = userData.name || userData.fullName || userData.full_name || userData.username || '';
      const company = userData.company || userData.companyName || userData.company_name || '';
      const email = userData.email || userData.emailAddress || userData.email_address || '';
      const password = userData.password || userData.pwd || userData.pass || '';
      
      console.log('Extracted fields:', { 
        name: name || '(empty)',
        company: company || '(empty)',
        email: email || '(empty)',
        hasPassword: !!password
      });
      
      // Validate required fields
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!company) missingFields.push('company');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      
      if (missingFields.length > 0) {
        console.warn(`Missing required fields: ${missingFields.join(', ')}`);
        
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(', ')}`,
          details: { 
            missingFields,
            receivedFields: Object.keys(userData),
            receivedContentType: req.headers['content-type'],
            bodyType: typeof req.body
          }
        });
      }
      
      // For testing, just return a success response
      console.log('All required fields present, sending success response');
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: `mock-${Date.now()}`,
          name: name,
          company: company,
          email: email,
          role: 'recruiter'
        },
        token: `mock-token-${Date.now()}`
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Server error processing registration',
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  });
});

// Login endpoint - Simplified with fallback
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // We'll skip actual Azure AD B2C verification and use demo accounts
    console.log('Using demo authentication mode');
    
    // Demo accounts for testing
    const validRecruiters = [
      {
        id: 'rec-001',
        email: 'recruiter@example.com',
        password: 'password123',
        name: 'Demo Recruiter',
        company: 'Demo Company',
        role: 'recruiter'
      },
      {
        id: 'rec-002',
        email: 'hr@company.com',
        password: 'hr123456',
        name: 'HR Manager',
        company: 'Tech Company',
        role: 'recruiter'
      },
      // Add your own email for testing
      {
        id: 'rec-custom',
        email: email,  // Accept any email
        password: password, // Accept any password that reaches here
        name: email.split('@')[0],
        company: 'Custom Company',
        role: 'recruiter'
      }
    ];
    
    // Check if email matches any recruiter
    const recruiter = validRecruiters.find(r => 
      r.email.toLowerCase() === email.toLowerCase());
    
    if (recruiter) {
      // In development mode, accept any password
      // In production, we would check passwords and use Azure B2C
      console.log('Demo recruiter login successful for:', email);
      return res.status(200).json({
        user: {
          id: recruiter.id,
          email: recruiter.email,
          name: recruiter.name || email.split('@')[0],
          company: recruiter.company,
          role: 'recruiter'
        },
        token: `demo-token-${Date.now()}`,
        userType: 'recruiter'
      });
    }
    
    // If no matching user, return invalid credentials
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Invalid email or password'
    });
  } catch (error) {
    console.error('Error in /api/login:', error);
    res.status(500).json({ error: 'Server error processing login' });
  }
});

// Debug endpoint to get Azure AD B2C token (only in development mode)
app.get('/api/debug/token', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Debug endpoints are disabled in production' });
  }
  
  try {
    const authHelper = require('./authHelper');
    const accessToken = await authHelper.getAccessToken();
    
    res.status(200).json({ 
      accessToken,
      message: 'Access token retrieved successfully' 
    });
  } catch (error) {
    console.error('Error getting debug token:', error);
    res.status(500).json({ error: 'Failed to get access token', message: error.message });
  }
});

// Error handler for unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Default port
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
