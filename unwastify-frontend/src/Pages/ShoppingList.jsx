import React, { useEffect, useState } from "react";
import {
  getShoppingList,
  generateShoppingList,
  markAsBought,
  deleteShoppingItem,
} from "../api";
import { getNextMonday } from "../utils";
import "./ShoppingList.css";

function ShoppingList() {
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [genStatus, setGenStatus] = useState("");
  const [manualTemp, setManualTemp] = useState("");

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      const res = await getShoppingList();
      const list = res.data.shopping_list;
      if (list && list.items) {
        list.items.sort((a, b) => a.item_name.localeCompare(b.item_name));
      }
      setShoppingList(list);
    } catch (err) {
      setError("Failed to load shopping list");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setGenStatus("");

    try {
      let coords = {};
      let directTemp = null;

      if (manualTemp !== "" && !isNaN(parseFloat(manualTemp))) {
        // User provided temperature manually — skip geolocation entirely
        directTemp = parseFloat(manualTemp);
        setGenStatus(`Generating your shopping list…`);
      } else {
        // 1. Try GPS
        setGenStatus("Fetching your location…");
        if (navigator.geolocation) {
          coords = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
              () => resolve({}),
              { timeout: 5000, enableHighAccuracy: false }
            );
          });
        }

        // 2. Fall back to IP-based location if GPS failed/denied
        if (coords.lat == null) {
          try {
            setGenStatus("Using network location…");
            const ipRes = await fetch("https://ipapi.co/json/");
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              coords = { lat: ipData.latitude, lon: ipData.longitude };
            }
          } catch {
            // silently ignore — Lambda will use default temp
          }
        }

        if (coords.lat != null) {
          setGenStatus("Fetching temperature for your area…");
        } else {
          setGenStatus("Generating your shopping list…");
        }
      }

      const res = await generateShoppingList({ ...coords, temp: directTemp });
      const temp = res.data.temperature_used;

      fetchShoppingList();
      setGenStatus(
        temp != null
          ? `Done! Temperature used: ${temp}°C`
          : "Shopping list generated!"
      );
    } catch (err) {
      setError("Failed to generate shopping list");
      setGenStatus("");
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkBought = async (shopping_item_id) => {
    try {
      await markAsBought(shopping_item_id);
    } catch (err) {
      console.error("markAsBought error", err.response?.data ?? err);
      setError("Failed to mark item bought");
    }
    fetchShoppingList();
  };

  const handleDelete = async (shopping_item_id) => {
    await deleteShoppingItem(shopping_item_id);
    fetchShoppingList();
  };

  if (loading) return <div className="loading">Loading shopping list…</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Shopping list</h2>
        <button
          className="btn-primary generate-btn"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? "Generating…" : "Generate with ML"}
        </button>
      </div>

      <div className="temp-override">
        <label htmlFor="manual-temp">Current temperature in °C [optional]</label>
        <input
          id="manual-temp"
          type="number"
          placeholder="e.g. 3"
          value={manualTemp}
          onChange={(e) => setManualTemp(e.target.value)}
        />
      </div>

      {genStatus && <p className="gen-status">{genStatus}</p>}
      {error && <div className="error-msg">{error}</div>}

      {!shoppingList || shoppingList.items?.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"></div>
          No items yet. Click Generate to create your shopping list from your pantry and family info.
        </div>
      ) : (
        <div className="card">
          <p className="week-label">Week of {getNextMonday()}</p>
          {shoppingList.items.map((item) => (
            <div
              className={`shopping-item ${item.bought ? "bought" : ""}`}
              key={item.shopping_item_id}
            >
              <div className="shopping-item-info">
                <span className="item-name">{item.item_name}</span>
                <span className="item-qty">Qty: {item.qty}</span>
              </div>
              <div className="item-actions">
                {!item.bought && (
                  <button
                    className="btn-primary"
                    onClick={() => handleMarkBought(item.shopping_item_id)}
                  >
                    ✓ Bought
                  </button>
                )}
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(item.shopping_item_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShoppingList;