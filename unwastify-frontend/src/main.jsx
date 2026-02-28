// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";

const redirect_uri =
  window.location.hostname === "localhost"
    ? "http://localhost:5173"
    : "https://d1yat59iwg4dcp.cloudfront.net";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_DbTJpJAL3",
  client_id: "1n0raneja90rbsmqjbugggefh9",
  redirect_uri: redirect_uri,
  post_logout_redirect_uri: redirect_uri,
  post_logout_redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "email openid profile",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
