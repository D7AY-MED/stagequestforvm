/**
 * Authentication service for Azure AD B2C
 * Handles user registration and login
 */

// Base API URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Register a new recruiter account with Azure AD B2C
 * @param {Object} userData - User registration data
 * @param {string} userData.name - Full name of the user
 * @param {string} userData.company - Company name
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} - Registration response
 */
export const registerRecruiter = async (userData) => {
  const { name, company, email, password } = userData;
  
  try {
    console.log('Registering recruiter with API:', userData);
    
    // Ensure all required fields are present
    if (!name || !company || !email || !password) {
      console.error('Missing required fields in userData:', userData);
      throw new Error('All fields (name, company, email, password) are required');
    }
    
    // Format the payload according to Azure AD B2C requirements
    const userPayload = {
      accountEnabled: true,
      displayName: name,
      mailNickname: email.split("@")[0],
      userPrincipalName: `${email.split("@")[0]}@stagequestrecruterb2c.onmicrosoft.com`,
      identities: [
        {
          signInType: "emailAddress",
          issuer: "stagequestrecruterb2c.onmicrosoft.com", // Your B2C tenant domain
          issuerAssignedId: email,
        }
      ],
      passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password: password,
      },
      companyName: company,

      // Optional: Add actual email property
      mail: email,
      otherMails: [email],

      // Optional custom attribute - replace with your actual extension ID
      "extension_<custom-id>_userType": "recruiter"
    };

    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userPayload),
    });

    // Log raw response for debugging
    console.log('API response status:', response.status);
    
    const responseData = await response.json();
    console.log('API response data:', responseData);

    if (!response.ok) {
      console.error('Fetch error from ' + `${API_URL}/api/register` + ':', responseData);
      throw new Error(responseData.error || responseData.message || `Server error: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Registration service error:', error);
    
    // Check if it's a connection error or server error
    if (error.message === 'Failed to fetch') {
      console.warn('API connection failed, using fallback mode');
      return {
        user: {
          id: `local-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          company: userData.company,
          role: 'recruiter',
        },
        token: `local-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        fallbackMode: true,
      };
    }
    throw error;
  }
};

/**
 * Register a new recruiter
 * @param {Object} formData - Registration data
 * @returns {Promise<Object>} Registration result with user and token
 */
export async function registerRecruiter(formData) {
  try {
    console.log('Registering with API:', formData);
    const response = await fetch(`${config.apiUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API registration successful:', data);
    return data;
  } catch (error) {
    console.error('Registration service error:', error);
    
    // If connection fails, use fallback
    if (error.message === 'Failed to fetch') {
      console.log('API unavailable, using fallback mode');
      const fallbackData = {
        user: {
          id: `local-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          role: 'recruiter',
        },
        token: `local-${Date.now()}`
      };
      console.log('Fallback data:', fallbackData);
      return fallbackData;
    }
    
    throw error;
  }
}

/**
 * Login a user with Azure AD B2C
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} - Login response with token
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `Login failed: ${response.status}`;
      } catch (e) {
        errorMessage = `Login failed with status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Store the token
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  } catch (error) {
    // If API is down, provide a fallback for demo accounts
    if (error.message === 'Failed to fetch') {
      if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
        return {
          user: {
            id: 'demo-user',
            name: 'Demo User',
            email: credentials.email,
            role: 'student',
          },
          token: 'demo-token',
          fallbackMode: true,
        };
      }
    }
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout current user
 */
export const logout = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is logged in
 * @returns {boolean} - True if logged in
 */
export const isLoggedIn = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    // Basic structure check for JWT
    const parts = token.split('.');
    return parts.length === 3;
  } catch (e) {
    console.error('Invalid token format');
    localStorage.removeItem('authToken');
    return false;
  }
};
