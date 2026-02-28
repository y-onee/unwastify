import React, { useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);

  return (
    <div className="login-container">
      <div className="blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <div className={`login-card ${showLoginForm ? "expanded" : ""}`}>
        <div className="sparkle sparkle-1">✨</div>
        <div className="sparkle sparkle-2">✨</div>
        <div className="login-logo">🎀</div>
        <h1>Unwastify</h1>
        <p className="tagline">Smart shopping, less waste.</p>
        
        {!showLoginForm ? (
          <div className="welcome-step">
            <p className="cute-text">Let's make shopping magical and reduce waste together! ✨</p>
            <button 
              className="btn-primary" 
              onClick={() => setShowLoginForm(true)}
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="auth-wrapper">
            <Authenticator hideSignUp={false}>
              {({ signOut, user }) => {
                if (user) {
                  navigate("/dashboard");
                }
                return null;
              }}
            </Authenticator>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
