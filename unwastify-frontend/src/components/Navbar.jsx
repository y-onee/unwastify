import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import "./Navbar.css";

function Navbar() {
  const auth = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    const clientId = "1n0raneja90rbsmqjbugggefh9";
    const logoutUri =
      window.location.hostname === "localhost"
        ? "http://localhost:5173"
        : "https://d1yat59iwg4dcp.cloudfront.net";

    auth.removeUser();
    window.location.replace(
      `https://unwastify.auth.us-east-1.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`,
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Unwastify</div>
      <div className="navbar-links">
        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "active" : ""}
        >
          Dashboard
        </Link>
        <Link
          to="/pantry"
          className={location.pathname === "/pantry" ? "active" : ""}
        >
          Pantry
        </Link>
        <Link
          to="/shopping-list"
          className={location.pathname === "/shopping-list" ? "active" : ""}
        >
          Shopping List
        </Link>
        <Link
          to="/family-info"
          className={location.pathname === "/family-info" ? "active" : ""}
        >
          Family Info
        </Link>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
