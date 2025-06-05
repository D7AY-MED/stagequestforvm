export const msalConfig = {
	auth: {
		clientId: process.env.REACT_APP_AZURE_CLIENT_ID || "466358db-83f0-49bb-a072-e4726fd98146", // Confirmed SPA client ID
    authority: "https://stagequestrecruterb2c.b2clogin.com/stagequestrecruterb2c.onmicrosoft.com/B2C_1_recruters", // Ensure this matches your Azure setup
    redirectUri: window.location.origin + "/auth/recruiter/callback", // Dynamically set redirect URI
    knownAuthorities: ["stagequestrecruterb2c.b2clogin.com"], // Ensure correct authority
  },
	cache: {
		cacheLocation: "localStorage", // Recommended for SPAs
		storeAuthStateInCookie: false, // Avoid using cookies for SPAs
	},
};
