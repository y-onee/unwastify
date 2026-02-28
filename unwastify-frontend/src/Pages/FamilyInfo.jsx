import React, { useEffect, useState } from "react";
import { getFamilyInfo, updateFamilyInfo } from "../api";
import "./FamilyInfo.css";

const EMPTY_FORM = {
  num_adults: "",
  num_kids: "",
  meals_per_day: "",
  eat_out_per_week: "",
};

function FamilyInfo() {
  const [current, setCurrent] = useState(null); // stored values
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilyInfo();
  }, []);

  const fetchFamilyInfo = async () => {
    try {
      const res = await getFamilyInfo();
      const info = res.data.family_info || {};
      setCurrent(info);
      setForm({
        num_adults: info.num_adults ?? "",
        num_kids: info.num_kids ?? "",
        meals_per_day: info.meals_per_day ?? "",
        eat_out_per_week: info.eat_out_per_week ?? "",
      });
    } catch (err) {
      setError("Failed to load family info");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await updateFamilyInfo({
        num_adults: parseInt(form.num_adults),
        num_kids: parseInt(form.num_kids),
        meals_per_day: parseInt(form.meals_per_day),
        eat_out_per_week: parseInt(form.eat_out_per_week),
      });
      setSuccess(true);
      setEditing(false);
      fetchFamilyInfo();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update family info");
    }
  };

  const hasInfo = current && Object.keys(current).length > 0;

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Family info</h2>
        {!editing && hasInfo && (
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            Edit for next week
          </button>
        )}
      </div>

      {success && <div className="success-msg">Family info updated.</div>}
      {error && <div className="error-msg">{error}</div>}

      {/* Read-only view */}
      {!editing && hasInfo && (
        <div className="card">
          <p className="form-intro">
            These settings are used to tailor your weekly shopping list.
          </p>
          <div className="family-info-grid">
            <div className="family-info-item">
              <span className="family-info-label">Adults</span>
              <span className="family-info-value">{current.num_adults}</span>
            </div>
            <div className="family-info-item">
              <span className="family-info-label">Kids</span>
              <span className="family-info-value">{current.num_kids}</span>
            </div>
            <div className="family-info-item">
              <span className="family-info-label">Meals / day</span>
              <span className="family-info-value">{current.meals_per_day}</span>
            </div>
            <div className="family-info-item">
              <span className="family-info-label">Eat-outs / week</span>
              <span className="family-info-value">{current.eat_out_per_week}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit form */}
      {(editing || !hasInfo) && (
        <div className="card add-form">
          <h3>{hasInfo ? "Edit for next week" : "Set up your family info"}</h3>
          <p className="form-intro">
            This helps us tailor your shopping list and reduce waste.
          </p>
          <div className="form-group">
            <label htmlFor="num_adults">Number of adults</label>
            <input
              id="num_adults"
              type="number"
              min="0"
              placeholder="e.g. 2"
              value={form.num_adults}
              onChange={(e) => setForm({ ...form, num_adults: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="num_kids">Number of kids</label>
            <input
              id="num_kids"
              type="number"
              min="0"
              placeholder="e.g. 1"
              value={form.num_kids}
              onChange={(e) => setForm({ ...form, num_kids: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="meals_per_day">Meals per day</label>
            <input
              id="meals_per_day"
              type="number"
              min="0"
              placeholder="e.g. 3"
              value={form.meals_per_day}
              onChange={(e) =>
                setForm({ ...form, meals_per_day: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="eat_out_per_week">Eat out per week</label>
            <input
              id="eat_out_per_week"
              type="number"
              min="0"
              placeholder="e.g. 2"
              value={form.eat_out_per_week}
              onChange={(e) =>
                setForm({ ...form, eat_out_per_week: e.target.value })
              }
            />
          </div>
          <div className="form-actions">
            <button className="btn-primary submit-btn" onClick={handleSubmit}>
              Save
            </button>
            {editing && (
              <button
                className="btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyInfo;
