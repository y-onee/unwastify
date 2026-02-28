import React, { useEffect, useState } from "react";
import { getPantry } from "../api";
import { fetchUserAttributes } from "aws-amplify/auth";
import { formatDate } from "../utils";
import "./Dashboard.css";

function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [pantry, setPantry] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    getUserEmail();
  }, []);

  const getUserEmail = async () => {
    try {
      const attributes = await fetchUserAttributes();
      setUserEmail(attributes.email);
    } catch (err) {
      console.error("Error fetching user attributes", err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await getPantry();
      const sortedPantry = (res.data.pantry || []).sort((a, b) => 
        a.item_name.localeCompare(b.item_name)
      );
      setPantry(sortedPantry);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalWasted = pantry.reduce((sum, item) => sum + (item.wasted || 0), 0);
  const expiringSoon = pantry.filter((item) => {
    const days =
      (new Date(
        String(item.date_expiry).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
      ) -
        new Date()) /
      (1000 * 60 * 60 * 24);
    return days <= 2 && days >= 0;
  }).sort((a, b) => a.date_expiry - b.date_expiry);

  const totalQty = pantry.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalHandling = totalQty + totalWasted;
  const utilization = totalHandling > 0 ? Math.round((totalQty / totalHandling) * 100) : 100;

  // Circle bar math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (utilization / 100) * circumference;

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <h2>Welcome back</h2>
        <p>{userEmail}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{pantry.length}</div>
          <div className="stat-label">Pantry items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalWasted}</div>
          <div className="stat-label">Total wasted</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{expiringSoon.length}</div>
          <div className="stat-label">Expiring soon</div>
        </div>
      </div>

      {expiringSoon.length > 0 && (
        <div className="card dashboard-section">
          <h3>Expiring soon</h3>
          <ul className="expiring-list">
            {expiringSoon.map((item) => (
              <li className="expiring-item" key={item.pantry_item_id}>
                <span>{item.item_name}</span>
                <span className="expiry-date">Expires: {formatDate(item.date_expiry)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card eco-score-card">
        <h3>Zero-Waste Score</h3>
        <p style={{ margin: "0 0 1.5rem", fontSize: "0.85rem" }}>Percentage of groceries utilized vs. wasted.</p>
        <div className="circle-wrap">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} className="circle-bg" />
            <circle 
              cx="60" 
              cy="60" 
              r={radius} 
              className="circle-progress" 
              style={{ strokeDashoffset, strokeDasharray: circumference }} 
            />
          </svg>
          <div className="circle-text">{utilization}%</div>
        </div>
        <p>
          {utilization >= 90 ? "Amazing! You're a zero-waste hero." : 
           utilization >= 70 ? "Great job! Keep reducing that waste." : 
           "Let's try to use up more of those groceries this week!"}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
