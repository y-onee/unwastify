import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import "./Navbar.css";

function Navbar() {
  const auth = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">Unwastify</div>
      <div className="navbar-links">
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
        <button
          className="btn-secondary"
          onClick={() => auth.signoutRedirect()}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
