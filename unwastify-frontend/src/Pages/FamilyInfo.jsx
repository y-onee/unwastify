import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import { updateFamilyInfo } from "../api";
import "./FamilyInfo.css";

function FamilyInfo() {
  const auth = useAuth();
  const [form, setForm] = useState({
    num_adults: "",
    num_kids: "",
    meals_per_day: "",
    eat_out_per_week: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      await updateFamilyInfo(auth, {
        num_adults: parseInt(form.num_adults),
        num_kids: parseInt(form.num_kids),
        meals_per_day: parseInt(form.meals_per_day),
        eat_out_per_week: parseInt(form.eat_out_per_week),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update family info");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Family Info</h2>
      </div>

      {success && <div className="success-msg">Family info updated!</div>}
      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <div className="form-group">
          <label>Number of Adults</label>
          <input
            type="number"
            placeholder="e.g. 2"
            value={form.num_adults}
            onChange={(e) => setForm({ ...form, num_adults: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Number of Kids</label>
          <input
            type="number"
            placeholder="e.g. 1"
            value={form.num_kids}
            onChange={(e) => setForm({ ...form, num_kids: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Meals per Day</label>
          <input
            type="number"
            placeholder="e.g. 3"
            value={form.meals_per_day}
            onChange={(e) =>
              setForm({ ...form, meals_per_day: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>Eat Out per Week</label>
          <input
            type="number"
            placeholder="e.g. 2"
            value={form.eat_out_per_week}
            onChange={(e) =>
              setForm({ ...form, eat_out_per_week: e.target.value })
            }
          />
        </div>
        <button className="btn-primary submit-btn" onClick={handleSubmit}>
          Save
        </button>
      </div>
    </div>
  );
}

export default FamilyInfo;
