import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import {
  getPantry,
  addToPantry,
  deletePantryItem,
  markExpired,
  markWasted,
} from "../api";
import "./Pantry.css";

function Pantry() {
  const auth = useAuth();
  const [pantry, setPantry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: "",
    qty: "",
    shelf_life: "",
  });
  const [wastedInputs, setWastedInputs] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPantry();
  }, []);

  const fetchPantry = async () => {
    try {
      const res = await getPantry(auth);
      setPantry(res.data.pantry);
    } catch (err) {
      setError("Failed to load pantry");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      await addToPantry(auth, newItem);
      setNewItem({ item_name: "", qty: "", shelf_life: "" });
      setShowAddForm(false);
      fetchPantry();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      }
    }
  };

  const handleDelete = async (pantry_item_id) => {
    await deletePantryItem(auth, pantry_item_id);
    fetchPantry();
  };

  const handleMarkExpired = async (pantry_item_id) => {
    await markExpired(auth, pantry_item_id);
    fetchPantry();
  };

  const handleMarkWasted = async (pantry_item_id) => {
    const qty = wastedInputs[pantry_item_id];
    if (!qty) return;
    await markWasted(auth, pantry_item_id, parseInt(qty));
    setWastedInputs({ ...wastedInputs, [pantry_item_id]: "" });
    fetchPantry();
  };

  if (loading) return <div className="loading">Loading pantry...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>My Pantry</h2>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          + Add Item
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showAddForm && (
        <div className="card add-form">
          <h3>Add Item</h3>
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
            value={newItem.qty}
            onChange={(e) =>
              setNewItem({ ...newItem, qty: parseInt(e.target.value) })
            }
          />
          <input
            placeholder="Shelf life (days) — only if new item"
            type="number"
            value={newItem.shelf_life}
            onChange={(e) =>
              setNewItem({ ...newItem, shelf_life: parseInt(e.target.value) })
            }
          />
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

      {pantry.length === 0 ? (
        <div className="empty-state">No items in pantry. Add some!</div>
      ) : (
        pantry.map((item) => (
          <div className="card item-card" key={item.pantry_item_id}>
            <div className="item-header">
              <div>
                <h3>{item.item_name}</h3>
                <p>
                  Qty: {item.qty} · Wasted: {item.wasted} · Expires:{" "}
                  {item.date_expiry}
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
                value={wastedInputs[item.pantry_item_id] || ""}
                onChange={(e) =>
                  setWastedInputs({
                    ...wastedInputs,
                    [item.pantry_item_id]: e.target.value,
                  })
                }
              />
              <button
                className="btn-secondary"
                onClick={() => handleMarkWasted(item.pantry_item_id)}
              >
                Mark Wasted
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Pantry;
