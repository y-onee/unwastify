import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
      <Link to="/dashboard" className="navbar-brand">
        Unwastify
      </Link>
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
          Shopping list
        </Link>
        <Link
          to="/family-info"
          className={location.pathname === "/family-info" ? "active" : ""}
        >
          Family info
        </Link>
        <button className="btn-secondary btn-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
