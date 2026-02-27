import React from "react";
import { useAuth } from "react-oidc-context";
import "./Login.css";

function Login() {
  const auth = useAuth();

  const handleSignIn = () => {
    console.log("auth object:", auth);
    auth.signinRedirect();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">🛒</div>
        <h1>Unwastify</h1>
        <p>Smart shopping, less waste</p>
        <button className="btn-primary login-btn" onClick={handleSignIn}>
          Sign In / Register
        </button>
      </div>
    </div>
  );
}

export default Login;
