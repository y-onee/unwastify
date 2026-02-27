import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import {
  getShoppingList,
  generateShoppingList,
  markAsBought,
  deleteShoppingItem,
} from "../api";
import "./ShoppingList.css";

function ShoppingList() {
  const auth = useAuth();
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      const res = await getShoppingList(auth);
      setShoppingList(res.data.shopping_list);
    } catch (err) {
      setError("Failed to load shopping list");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateShoppingList(auth);
      fetchShoppingList();
    } catch (err) {
      setError("Failed to generate shopping list");
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkBought = async (shopping_item_id) => {
    await markAsBought(auth, shopping_item_id);
    fetchShoppingList();
  };

  const handleDelete = async (shopping_item_id) => {
    await deleteShoppingItem(auth, shopping_item_id);
    fetchShoppingList();
  };

  if (loading) return <div className="loading">Loading shopping list...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Shopping List</h2>
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? "Generating..." : "✨ Generate with AI"}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {!shoppingList || shoppingList.items?.length === 0 ? (
        <div className="empty-state">
          No items. Click Generate to create your shopping list!
        </div>
      ) : (
        <div className="card">
          <p className="week-label">Week of {shoppingList.date}</p>
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
