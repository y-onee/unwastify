import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useState, useEffect } from "react";
import Login from "./Pages/Login";
import Pantry from "./Pages/Pantry";
import ShoppingList from "./Pages/ShoppingList";
import FamilyInfo from "./Pages/FamilyInfo";
import Navbar from "./components/Navbar";
import Dashboard from "./Pages/Dashboard";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    checkUser();

    // Listen for auth events
    const unsubscribe = Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signedIn":
          setIsAuthenticated(true);
          break;
        case "signedOut":
          setIsAuthenticated(false);
          break;
        case "tokenRefresh_failure":
          setIsAuthenticated(false);
          break;
      }
    });

    return unsubscribe;
  }, []);

  const checkUser = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app-shell">
        {isAuthenticated && <Navbar />}
        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
              }
            />
            <Route
              path="/pantry"
              element={isAuthenticated ? <Pantry /> : <Navigate to="/" />}
            />
            <Route
              path="/shopping-list"
              element={
                isAuthenticated ? <ShoppingList /> : <Navigate to="/" />
              }
            />
            <Route
              path="/family-info"
              element={
                isAuthenticated ? <FamilyInfo /> : <Navigate to="/" />
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/" />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
