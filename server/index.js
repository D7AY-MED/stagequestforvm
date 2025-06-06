// Simple Express server with registration endpoint
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) =
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic registration endpoint
app.post('/api/register', (req, res) =
  console.log('Registration request received:', req.body);
  const { name, company, email, password } = req.body;

  // Validate required fields
    return res.status(400).json({ 
      error: `Missing required fields: ${ ''}${ ''}${ ''}`,
      details: { missingFields: [ null,  null,  null].filter(Boolean) }
    });
  }

  // Mock successful response
  res.status(201).json({
    success: true,
    token: `mock-token-${Date.now()}`,
    user: {
      id: `mock-${Date.now()}`,
      name,
      email,
      company,
      role: 'recruiter'
    }
  });
});

// Start server
  console.log(`API server running on port ${port}`);
});
