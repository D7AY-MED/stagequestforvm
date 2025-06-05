/**
 * Azure AD B2C Authentication Helper
 * Provides utility functions for user registration and authentication
 */

const axios = require('axios');

// Azure AD B2C configuration
const config = {
  tenantId: "08aeb7f5-f9cc-4a5a-91d0-b76897b82896",
  clientId: "466358db-83f0-49bb-a072-e4726fd98146",
  clientSecret: "~QF8Q~FqOWlV7ONYJO38No2XkLHaoOZ75HUiEdg3",
  verifiedDomain: "stagequestrecruterb2c.onmicrosoft.com",
  scope: "https://graph.microsoft.com/.default"
};

/**
 * Get an access token for Microsoft Graph API
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
  console.log('Getting access token for Azure AD B2C...');
  
  const tokenEndpoint = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  
  try {
    const response = await axios.post(tokenEndpoint, new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: config.scope,
      grant_type: "client_credentials",
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    
    console.log('Access token obtained successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error.response?.data || error.message);
    throw new Error(`Failed to get Azure AD B2C access token: ${error.message}`);
  }
}

/**
 * Create a new user in Azure AD B2C
 * @param {Object} userData User data for registration
 * @returns {Promise<Object>} Created user data
 */
async function createUser(userData) {
  console.log('Creating user in Azure AD B2C:', {
    ...userData,
    password: '***REDACTED***'
  });
  
  const { name, company, email, password } = userData;
  
  if (!name || !company || !email || !password) {
    throw new Error('Missing required user data fields');
  }
  
  // Validate password complexity
  validatePassword(password);
  
  try {
    // Get access token
    const accessToken = await getAccessToken();
    
    // Prepare user payload for Azure AD B2C
    const userEndpoint = "https://graph.microsoft.com/v1.0/users";
    
    // Format username to be valid for Azure AD
    const mailNickname = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    
    const userPayload = {
      accountEnabled: true,
      displayName: name,
      mailNickname: mailNickname,
      userPrincipalName: `${mailNickname}@${config.verifiedDomain}`,
      passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password: password
      },
      companyName: company,
      jobTitle: "Recruiter",
      identities: [
        {
          signInType: "emailAddress",
          issuer: config.verifiedDomain,
          issuerAssignedId: email
        }
      ]
    };
    
    console.log(`Creating user in Azure AD B2C with email ${email}`);
    
    try {
      const response = await axios.post(userEndpoint, userPayload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      console.log('User created successfully in Azure AD B2C:', response.data.id);
      return response.data;
    } catch (apiError) {
      console.error('Azure AD B2C API error:', apiError.response?.data || apiError.message);
      
      // Check for existing user error
      if (apiError.response && apiError.response.data && 
          apiError.response.data.error && 
          apiError.response.data.error.message && 
          apiError.response.data.error.message.includes('already exists')) {
        throw new Error(`User with email ${email} already exists in Azure AD B2C`);
      }
      
      throw new Error(`Failed to create user in Azure AD B2C: ${apiError.response?.data?.error?.message || apiError.message}`);
    }
  } catch (error) {
    console.error('Error in createUser:', error.message);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Find a user by email in Azure AD B2C
 * @param {string} email Email address to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function findUserByEmail(email) {
  if (!email) {
    throw new Error('Email is required');
  }
  
  try {
    const accessToken = await getAccessToken();
    
    // Create a filter to search by email (using identities)
    const userFilter = encodeURIComponent(`identities/any(i:i/issuerAssignedId eq '${email}')`);
    const searchEndpoint = `https://graph.microsoft.com/v1.0/users?$filter=${userFilter}`;
    
    console.log(`Searching for user with email: ${email}`);
    
    const response = await axios.get(searchEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'ConsistencyLevel': 'eventual',
        'Content-Type': 'application/json',
      },
    });
    
    const users = response.data.value;
    if (users.length === 0) {
      console.log('No user found with email:', email);
      return null;
    }
    
    console.log('User found:', users[0].displayName);
    return users[0];
  } catch (error) {
    console.error('Error finding user by email:', error.response?.data || error.message);
    throw new Error(`Failed to find user by email: ${error.message}`);
  }
}

/**
 * Validate password complexity
 * @param {string} password Password to validate
 * @throws {Error} If password doesn't meet requirements
 */
function validatePassword(password) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;
  
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial || !isLongEnough) {
    throw new Error(
      'Password must be at least 8 characters and include uppercase letters, ' +
      'lowercase letters, numbers, and special characters'
    );
  }
}

/**
 * Generate a secure session token
 * @param {string} userId User ID to include in token
 * @returns {string} Session token
 */
function generateSessionToken(userId) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `azureb2c-${userId}-${timestamp}-${randomString}`;
}

module.exports = {
  getAccessToken,
  createUser,
  findUserByEmail,
  validatePassword,
  generateSessionToken,
  config
};
