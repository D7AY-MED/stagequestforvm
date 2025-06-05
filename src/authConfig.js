import { PublicClientApplication } from '@azure/msal-browser';

// Use environment variables with fallback values
const clientId = process.env.REACT_APP_AZURE_CLIENT_ID || "dad8c5ba-b384-42da-946e-3bc8ebfdb1d2";
const tenantName = "StageQuest";

const msalConfig = {
  auth: {
    clientId: clientId,
    authority: `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/B2C_1A_signup_signin`,
    redirectUri: window.location.origin,
    knownAuthorities: [`${tenantName}.b2clogin.com`],
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
