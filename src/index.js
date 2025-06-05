import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/msalConfig";
import { BrowserRouter } from "react-router-dom";
import { getEnv } from "./utils/loadEnv";

// Initialize MSAL with environment variables that might come from Docker
const msalConfigWithEnv = {
  ...msalConfig,
  auth: {
    ...msalConfig.auth,
    clientId: getEnv('REACT_APP_AZURE_CLIENT_ID') || msalConfig.auth.clientId,
  }
};

const msalInstance = new PublicClientApplication(msalConfigWithEnv);

// Make sure to use createRoot for React 18
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot ? ReactDOM.createRoot(rootElement) : null;

if (root) {
  // React 18
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // React 17 and below
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </BrowserRouter>
    </React.StrictMode>,
    rootElement
  );
}