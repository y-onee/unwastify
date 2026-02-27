import axios from "axios";

const BASE_URL = "https://dafe3rfji4.execute-api.us-east-1.amazonaws.com/prod";

const getToken = (auth) => auth.user?.id_token;

const headers = (auth) => ({
  Authorization: `Bearer ${getToken(auth)}`,
  "Content-Type": "application/json",
});

// Pantry
export const getPantry = (auth) =>
  axios.get(`${BASE_URL}/get_pantry`, { headers: headers(auth) });

export const addToPantry = (auth, data) =>
  axios.post(`${BASE_URL}/add_to_pantry`, data, { headers: headers(auth) });

export const deletePantryItem = (auth, pantry_item_id) =>
  axios.delete(`${BASE_URL}/delete_pantry_item`, {
    headers: headers(auth),
    data: { pantry_item_id },
  });

export const markExpired = (auth, pantry_item_id) =>
  axios.put(
    `${BASE_URL}/mark_expired`,
    { pantry_item_id },
    { headers: headers(auth) },
  );

export const markWasted = (auth, pantry_item_id, wasted_qty) =>
  axios.put(
    `${BASE_URL}/mark_wasted`,
    { pantry_item_id, wasted_qty },
    { headers: headers(auth) },
  );

// Shopping List
export const getShoppingList = (auth) =>
  axios.get(`${BASE_URL}/get_shopping_list`, { headers: headers(auth) });

export const generateShoppingList = (auth) =>
  axios.get(`${BASE_URL}/generate_shopping_list`, { headers: headers(auth) });

export const markAsBought = (auth, shopping_item_id) =>
  axios.put(
    `${BASE_URL}/mark_as_bought`,
    { shopping_item_id },
    { headers: headers(auth) },
  );

export const deleteShoppingItem = (auth, shopping_item_id) =>
  axios.delete(`${BASE_URL}/delete_shopping_item`, {
    headers: headers(auth),
    data: { shopping_item_id },
  });

// Family Info
export const updateFamilyInfo = (auth, data) =>
  axios.put(`${BASE_URL}/update_family_info`, data, { headers: headers(auth) });
