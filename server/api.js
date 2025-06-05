import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";
import { addHealthCheck } from "./health-check.js";

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost", "http://frontend"],
  methods: ["GET", "POST", "OPTIONS", "HEAD"], 
  allowedHeaders: ["Content-Type", "Authorization"] 
}));

app.use(bodyParser.json());

// Check middleware to log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} received`);
  next();
});

// Add health check endpoints
addHealthCheck(app);

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { name, company, email, password } = req.body;

  if (!name || !company || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate password against Azure AD B2C requirements
  const username = email.split('@')[0].toLowerCase();
  const lowercasePassword = password.toLowerCase();
  
  // Check if password contains username
  if (lowercasePassword.includes(username.toLowerCase())) {
    return res.status(400).json({ 
      message: "Password validation failed",
      error: "Password cannot contain your username or email address"
    });
  }
  
  // Check if password contains parts of the display name
  const nameParts = name.toLowerCase().split(' ');
  const containsNamePart = nameParts.some(part => part.length > 2 && lowercasePassword.includes(part));
  if (containsNamePart) {
    return res.status(400).json({ 
      message: "Password validation failed",
      error: "Password cannot contain parts of your full name"
    });
  }

  // Additional password complexity check
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial || !isLongEnough) {
    return res.status(400).json({
      message: "Password validation failed",
      error: "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters"
    });
  }

  try {
    // Azure AD B2C API configuration
    const tenantId = "08aeb7f5-f9cc-4a5a-91d0-b76897b82896"; // Replace with your Azure AD B2C tenant ID
    const clientId = "466358db-83f0-49bb-a072-e4726fd98146"; // Replace with your Azure AD B2C application ID
    const clientSecret = "~QF8Q~FqOWlV7ONYJO38No2XkLHaoOZ75HUiEdg3"; // Replace with your Azure AD B2C client secret
    const scope = "https://graph.microsoft.com/.default";
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    // Step 1: Get an access token
    const tokenResponse = await axios.post(tokenEndpoint, new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope,
      grant_type: "client_credentials",
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Use the user-provided password instead of generating one
    // Make sure the user's password meets Azure AD B2C complexity requirements
    const userPassword = password; // Using the password provided by the user in the request
    
    // Step 3: Create the user in Azure AD B2C
    const userEndpoint = "https://graph.microsoft.com/v1.0/users";
    const verifiedDomain = "stagequestrecruterb2c.onmicrosoft.com"; // Replace with your verified domain name
    const userPayload = {
      accountEnabled: true,
      displayName: name,
      mailNickname: email.split("@")[0],
      userPrincipalName: `${email.split("@")[0]}@${verifiedDomain}`, // Use verified domain
      passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password: userPassword, // Use the password provided by the user
      },
      companyName: company,
    };

    console.log("Payload being sent to Azure AD B2C:", userPayload);

    const userResponse = await axios.post(userEndpoint, userPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("User created in Azure AD B2C:", userResponse.data);
    res.status(200).json({ message: "User registered successfully in Azure AD B2C." });
  } catch (error) {
    // Log detailed error response
    console.error("Error creating user in Azure AD B2C:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to register user in Azure AD B2C.",
      error: error.response?.data || error.message,
    });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  console.log("Login attempt received:", req.body.email);
  
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Azure AD B2C API configuration
    const tenantId = "08aeb7f5-f9cc-4a5a-91d0-b76897b82896"; 
    const clientId = "466358db-83f0-49bb-a072-e4726fd98146"; 
    const clientSecret = "~QF8Q~FqOWlV7ONYJO38No2XkLHaoOZ75HUiEdg3"; 
    const scope = "https://graph.microsoft.com/.default";
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    console.log("Getting access token...");
    
    // Step 1: Get an access token for Microsoft Graph API
    const tokenResponse = await axios.post(tokenEndpoint, new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope,
      grant_type: "client_credentials",
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = tokenResponse.data.access_token;
    console.log("Access token obtained");

    // Step 2: Find the user by email in Azure AD B2C
    const verifiedDomain = "stagequestrecruterb2c.onmicrosoft.com";
    const userPrincipalName = `${email.split("@")[0]}@${verifiedDomain}`;
    
    console.log(`Looking up user with UPN: ${userPrincipalName}`);
    
    try {
      // Search for user by userPrincipalName
      const userEndpoint = `https://graph.microsoft.com/v1.0/users?$filter=userPrincipalName eq '${userPrincipalName}'`;
      console.log(`Sending request to ${userEndpoint}`);
      
      const userSearchResponse = await axios.get(userEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const users = userSearchResponse.data.value;
      
      if (users.length === 0) {
        console.log("No user found with this email");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const user = users[0];
      console.log(`Found user: ${user.displayName} (${user.id})`);
      
      // Step 3: For demo purposes, assume the password is correct
      // In production, use Azure AD B2C auth flow for proper password validation
      
      // Create a simple token with user info
      const tokenPayload = {
        sub: user.id,
        name: user.displayName,
        email: user.userPrincipalName,
        role: "recruiter",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
      };
      
      // Simple token
      const simpleToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
      
      // Return success response
      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          displayName: user.displayName,
          email: user.userPrincipalName,
          role: "recruiter"
        },
        token: simpleToken
      });
      
    } catch (error) {
      console.error("Error finding user:", error.response?.data || error.message);
      return res.status(500).json({
        message: "Authentication failed.",
        error: error.response?.data || error.message,
      });
    }
    
  } catch (error) {
    console.error("Error during login:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Login failed.",
      error: error.response?.data || error.message,
    });
  }
});

// Error handler for requests to undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found", 
    path: req.path,
    method: req.method
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Available endpoints:`);
  console.log(`- GET/HEAD /api/health - Check server health`);
  console.log(`- POST /api/register - Register new users`);
  console.log(`- POST /api/login - Authenticate users`);
});
