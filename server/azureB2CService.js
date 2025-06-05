/**
 * Azure AD B2C Service
 * Handles interactions with Azure AD B2C for user management
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
 * @returns {Promise<string>} The access token
 */
async function getAccessToken() {
  try {
    const tokenEndpoint = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
    
    const response = await axios.post(tokenEndpoint, new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: config.scope,
      grant_type: "client_credentials",
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error.message);
    throw new Error('Failed to authenticate with Azure AD B2C');
  }
}

/**
 * Create a user in Azure AD B2C
 * @param {Object} userData - User data containing name, email, company, password
 * @returns {Promise<Object>} The created user data
 */
async function createUser(userData) {
  const { name, email, company, password } = userData;
  
  if (!name || !email || !company || !password) {
    throw new Error('Missing required user data');
  }
  
  try {
    const accessToken = await getAccessToken();
    
    // Format username to be valid for Azure AD
    const mailNickname = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    const userPrincipalName = `${mailNickname}@${config.verifiedDomain}`;
    
    const userPayload = {
      accountEnabled: true,
      displayName: name,
      mailNickname: mailNickname,
      userPrincipalName: userPrincipalName,
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
    
    const userEndpoint = "https://graph.microsoft.com/v1.0/users";
    const response = await axios.post(userEndpoint, userPayload, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to create user in Azure AD B2C');
  }
}

/**
 * Find a user by email in Azure AD B2C
 * @param {string} email - The email to search for
 * @returns {Promise<Object|null>} The user data or null if not found
 */
async function findUserByEmail(email) {
  try {
    const accessToken = await getAccessToken();
    
    // Create a filter to search by email in identities
    const filter = encodeURIComponent(`identities/any(i:i/issuerAssignedId eq '${email}')`);
    const endpoint = `https://graph.microsoft.com/v1.0/users?$filter=${filter}`;
    
    const response = await axios.get(endpoint, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "ConsistencyLevel": "eventual"
      },
    });
    
    const users = response.data.value;
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Failed to find user by email:', error.message);
    return null;
  }
}

module.exports = {
  getAccessToken,
  createUser,
  findUserByEmail,
  config
};
