/**
 * This utility checks if your Supabase configurations are correctly set up.
 * Run this file with Node.js to debug your configuration.
 */

// Import environment loading function (for browser environments)
const { getEnv } = require('./loadEnv');

// Use either Node.js environment variables or browser-based environment
// This makes the script work both when run directly with Node.js and when used in browser
const getEnvVar = (key) => {
  // If running in Node.js
  if (typeof window === 'undefined') {
    return process.env[key];
  }
  // If running in browser
  return getEnv(key);
};

// Get environment variables
const studentUrl = getEnvVar('VITE_STUDENT_SUPABASE_URL');
const studentKey = getEnvVar('VITE_STUDENT_SUPABASE_ANON_KEY');
const azureClientId = getEnvVar('REACT_APP_AZURE_CLIENT_ID');
const azureTenantId = getEnvVar('REACT_APP_AZURE_TENANT_ID');

console.log('\n🔍 AUTHENTICATION CONFIGURATION CHECK\n');

// Check if running in Docker
const isDocker = getEnvVar('IS_DOCKER') === 'true' || 
                (typeof window !== 'undefined' && window.ENV && window.ENV.IS_DOCKER === 'true');
if (isDocker) {
  console.log('🐳 Running in Docker environment');
}

// Check student variables
console.log('--- STUDENT PROJECT (SUPABASE) ---');
if (!studentUrl) {
  console.log('❌ VITE_STUDENT_SUPABASE_URL is missing');
} else {
  console.log('✅ VITE_STUDENT_SUPABASE_URL is set:', maskUrl(studentUrl));
}

if (!studentKey) {
  console.log('❌ VITE_STUDENT_SUPABASE_ANON_KEY is missing');
} else {
  console.log('✅ VITE_STUDENT_SUPABASE_ANON_KEY is set:', maskKey(studentKey));
}

// Check Azure variables for recruiter authentication
console.log('\n--- RECRUITER PROJECT (AZURE AD B2C) ---');
if (!azureClientId) {
  console.log('❌ REACT_APP_AZURE_CLIENT_ID is missing');
} else {
  console.log('✅ REACT_APP_AZURE_CLIENT_ID is set:', maskKey(azureClientId));
}

if (!azureTenantId) {
  console.log('❌ REACT_APP_AZURE_TENANT_ID is missing');
} else {
  console.log('✅ REACT_APP_AZURE_TENANT_ID is set:', maskKey(azureTenantId));
}

console.log('\n📋 VERIFICATION SUMMARY');
if (studentUrl && studentKey && azureClientId && azureTenantId) {
  console.log('✅ All authentication environment variables are set');
} else {
  console.log('❌ Some authentication environment variables are missing');
  console.log('\nPlease add the missing variables to your:');
  console.log('- .env file (for local development)');
  console.log('- docker-compose.yml environment section (for Docker)');
  console.log(`
VITE_STUDENT_SUPABASE_URL=<your student project url>
VITE_STUDENT_SUPABASE_ANON_KEY=<your student project anon key>
REACT_APP_AZURE_CLIENT_ID=<your Azure AD B2C client ID>
REACT_APP_AZURE_TENANT_ID=<your Azure AD B2C tenant ID>
`);
}

// Helper functions to mask sensitive information
function maskUrl(url) {
  try {
    const visiblePart = url.substring(0, 15);
    return `${visiblePart}...`;
  } catch (e) {
    return 'Invalid URL format';
  }
}

function maskKey(key) {
  try {
    if (key.length > 10) {
      const firstPart = key.substring(0, 4);
      const lastPart = key.substring(key.length - 4);
      return `${firstPart}...${lastPart}`;
    }
    return 'Key too short';
  } catch (e) {
    return 'Invalid key format';
  }
}
