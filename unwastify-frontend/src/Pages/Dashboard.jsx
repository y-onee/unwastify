import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { getPantry } from "../api";
import "./Dashboard.css";

function Dashboard() {
  const auth = useAuth();
  const [pantry, setPantry] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getPantry(auth);
      setPantry(res.data.pantry || []);
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
  });

  const downloadExpiredPantry = () => {
    const expired = pantry.filter((item) => {
      const days =
        (new Date(
          String(item.date_expiry).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
        ) -
          new Date()) /
        (1000 * 60 * 60 * 24);
      return days < 0;
    });

    const csv = [
      "Item Name,Qty,Date Bought,Date Expired,Wasted",
      ...expired.map(
        (item) =>
          `${item.item_name},${item.qty},${item.date_bought},${item.date_expiry},${item.wasted}`,
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expired_pantry.csv";
    a.click();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <h2>Welcome back</h2>
        <p>{auth.user?.profile?.email}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{pantry.length}</div>
          <div className="stat-label">Pantry Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalWasted}</div>
          <div className="stat-label">Total Wasted</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{expiringSoon.length}</div>
          <div className="stat-label">Expiring Soon</div>
        </div>
      </div>

      {expiringSoon.length > 0 && (
        <div className="card">
          <h3>Expiring Soon</h3>
          {expiringSoon.map((item) => (
            <div className="expiring-item" key={item.pantry_item_id}>
              <span>{item.item_name}</span>
              <span className="expiry-date">Expires: {item.date_expiry}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card download-card">
        <h3>📥 Expired Pantry Report</h3>
        <p>Download a CSV of all your expired items.</p>
        <button className="btn-primary" onClick={downloadExpiredPantry}>
          Download Report
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
