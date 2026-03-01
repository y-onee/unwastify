import React, { useEffect, useState } from "react";
import {
  getPantry,
  addToPantry,
  deletePantryItem,
  markExpired,
  markWasted,
} from "../api";
import "./Pantry.css";

import { formatDate } from "../utils";

function Pantry() {
  const [pantry, setPantry] = useState([]);
  const [expiredPantry, setExpiredPantry] = useState([]);
  const [view, setView] = useState("current");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: "",
    qty: "",
    shelf_life: "",
  });
  const [requireShelfLife, setRequireShelfLife] = useState(false);
  const [wastedInputs, setWastedInputs] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPantry();
  }, []);

  const fetchPantry = async () => {
    try {
      const res = await getPantry();
      
      const sortedPantry = (res.data.pantry || []).sort((a, b) => 
        a.item_name.localeCompare(b.item_name)
      );
      const sortedExpired = (res.data.expired_pantry || []).sort((a, b) => {
        const dateA = new Date(String(a.date_expiry).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
        const dateB = new Date(String(b.date_expiry).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
        return dateB - dateA;
      });
      
      setPantry(sortedPantry);
      setExpiredPantry(sortedExpired);
    } catch (err) {
      setError("Failed to load pantry");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const payload = { ...newItem };
      if (!payload.qty || payload.qty <= 0) {
        setError("Quantity must be greater than zero.");
        return;
      }
      if (payload.shelf_life === "" || payload.shelf_life == null) {
        delete payload.shelf_life;
      }
      await addToPantry(payload);
      setNewItem({ item_name: "", qty: "", shelf_life: "" });
      setShowAddForm(false);
      setRequireShelfLife(false);
      fetchPantry();
    } catch (err) {
      if (err.response?.data?.error) {
        const errorMsg = err.response.data.error;
        setError(errorMsg);
        if (errorMsg === "Item not found. Please provide shelf_life to add it.") {
          setRequireShelfLife(true);
        }
      }
    }
  };

  const handleDelete = async (pantry_item_id) => {
    try {
      await deletePantryItem(pantry_item_id);
      fetchPantry();
      setError(""); // Clear any previous errors on successful delete
    } catch (err) {
      setError("Failed to delete item.");
    }
  };

  const handleMarkExpired = async (pantry_item_id) => {
    try {
      await markExpired(pantry_item_id);
      fetchPantry();
      setError(""); // Clear any previous errors on successful mark
    } catch (err) {
      setError("Failed to mark item as expired.");
    }
  };

  const handleMarkWasted = async (pantry_item_id) => {
    const wVal = parseInt(wastedInputs[pantry_item_id], 10);

    if (isNaN(wVal) || wVal < 0) {
      setError("Please enter a valid positive quantity (or 0) for waste.");
      return;
    }

    // Validation: Wasted quantity cannot exceed actual quantity
    const targetItem = pantry.concat(expiredPantry).find(item => item.pantry_item_id === pantry_item_id);
    if (!targetItem) {
      setError("Item not found.");
      return;
    }
    
    if (wVal > targetItem.qty) {
      setError(`Cannot set wasted quantity to ${wVal}. You only have ${targetItem.qty} items total.`);
      return;
    }

    try {
      await markWasted(pantry_item_id, wVal);
      setWastedInputs({ ...wastedInputs, [pantry_item_id]: "" });
      fetchPantry();
      setError(""); // Clear any previous errors on successful mark
    } catch (err) {
      setError("Failed to mark item as wasted.");
    }
  };

  if (loading) return <div className="loading">Loading pantry…</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>My pantry</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setRequireShelfLife(false);
            setNewItem({ item_name: "", qty: "", shelf_life: "" });
            setError("");
          }}
        >
          + Add item
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="pantry-toggle">
        <button
          type="button"
          className={`pantry-toggle-btn ${view === "current" ? "active" : ""}`}
          onClick={() => setView("current")}
        >
          Current
        </button>
        <button
          type="button"
          className={`pantry-toggle-btn ${view === "expired" ? "active" : ""}`}
          onClick={() => setView("expired")}
        >
          Expired
        </button>
      </div>

      {showAddForm && (
        <div className="card add-form">
          <h3>Add item</h3>
          <input
            placeholder="Item name"
            value={newItem.item_name}
            onChange={(e) =>
              setNewItem({ ...newItem, item_name: e.target.value })
            }
          />
          <input
            placeholder="Quantity"
            type="number"
            min="1"
            value={newItem.qty}
            onChange={(e) =>
              setNewItem({ ...newItem, qty: parseInt(e.target.value) })
            }
          />
          {requireShelfLife && (
            <input
              placeholder="Shelf life (days) — new item requires this"
              type="number"
              value={newItem.shelf_life}
              onChange={(e) => {
                const v = e.target.value;
                setNewItem({
                  ...newItem,
                  shelf_life: v === "" ? "" : parseInt(v),
                });
              }}
            />
          )}
          <div className="form-actions">
            <button className="btn-primary" onClick={handleAddItem}>
              Add
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Current (non-expired) items */}
      {view === "current" && (
        <section className="pantry-section">
          <h3 key="current-heading" className="pantry-section-title">
            Current items
          </h3>
          {pantry.length === 0 ? (
            <div className="empty-state" key="current-empty">
              <div className="empty-state-icon">📦</div>
              No items in pantry. Add your first item to get started.
            </div>
          ) : (
            pantry.map((item, index) => (
              <div
                className="card item-card"
                key={`current-${item.pantry_item_id ?? `i-${index}`}`}
              >
                <div className="item-header">
                  <div>
                    <h3>{item.item_name}</h3>
                    <p className="meta">
                      Qty: {item.qty} · Wasted: {item.wasted} · Expires:{" "}
                      {formatDate(item.date_expiry)}
                    </p>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-danger"
                      onClick={() => handleMarkExpired(item.pantry_item_id)}
                    >
                      Expired
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(item.pantry_item_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="wasted-row">
                  <input
                    placeholder="Wasted qty"
                    type="number"
                    min="0"
                    max={item.qty}
                    value={wastedInputs[item.pantry_item_id] || ""}
                    onChange={(e) => {
                      setWastedInputs({
                        ...wastedInputs,
                        [item.pantry_item_id]: e.target.value,
                      })
                    }}
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => handleMarkWasted(item.pantry_item_id)}
                  >
                    Mark wasted
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Expired items — view and update waste */}
      {view === "expired" && (
        <section className="pantry-section pantry-section-expired">
          <h3 key="expired-heading" className="pantry-section-title">
            Expired items
          </h3>
          <p key="expired-desc" className="pantry-section-desc">
            Record how much you had to throw away so we can improve future
            lists.
          </p>
          {expiredPantry.length === 0 ? (
            <div className="empty-state empty-state-sub" key="expired-empty">
              No expired items. When you mark something as expired it will show
              here.
            </div>
          ) : (
            expiredPantry.map((item, index) => (
              <div
                className="card item-card item-card-expired"
                key={`expired-${item.pantry_item_id ?? `i-${index}`}`}
              >
                <div className="item-header">
                  <div>
                    <h3>{item.item_name}</h3>
                    <p className="meta">
                      Qty: {item.qty} · Wasted: {item.wasted} · Expired:{" "}
                      {formatDate(item.date_expiry)}
                    </p>
                  </div>
                </div>
                <div className="wasted-row">
                  <input
                    placeholder="Wasted qty"
                    type="number"
                    min="0"
                    max={item.qty}
                    value={wastedInputs[item.pantry_item_id] || ""}
                    onChange={(e) => {
                      setWastedInputs({
                        ...wastedInputs,
                        [item.pantry_item_id]: e.target.value,
                      })
                    }}
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => handleMarkWasted(item.pantry_item_id)}
                  >
                    Update wasted
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}

export default Pantry;
