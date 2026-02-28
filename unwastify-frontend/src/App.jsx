import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "react-oidc-context";
import Login from "./Pages/Login";
import Pantry from "./Pages/Pantry";
import ShoppingList from "./Pages/ShoppingList";
import FamilyInfo from "./Pages/FamilyInfo";
import Navbar from "./components/Navbar";
import Dashboard from "./Pages/Dashboard";
import "./App.css";

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      {auth.isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            auth.isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          }
        />
        <Route
          path="/pantry"
          element={auth.isAuthenticated ? <Pantry /> : <Navigate to="/" />}
        />
        <Route
          path="/shopping-list"
          element={
            auth.isAuthenticated ? <ShoppingList /> : <Navigate to="/" />
          }
        />
        <Route
          path="/family-info"
          element={auth.isAuthenticated ? <FamilyInfo /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={auth.isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
