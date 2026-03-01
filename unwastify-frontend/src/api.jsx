import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const BASE_URL = "https://dafe3rfji4.execute-api.us-east-1.amazonaws.com/prod";

const getHeaders = async () => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  } catch (err) {
    console.error("Error fetching auth session", err);
    return { "Content-Type": "application/json" };
  }
};

// Pantry
export const getPantry = async () =>
  axios.get(`${BASE_URL}/get_pantry`, { headers: await getHeaders() });

export const addToPantry = async (data) =>
  axios.post(`${BASE_URL}/add_to_pantry`, data, { headers: await getHeaders() });

export const deletePantryItem = async (pantry_item_id) =>
  axios.delete(`${BASE_URL}/delete_pantry_item`, {
    headers: await getHeaders(),
    data: { pantry_item_id },
  });

export const markExpired = async (pantry_item_id) =>
  axios.put(
    `${BASE_URL}/mark_expired`,
    { pantry_item_id },
    { headers: await getHeaders() },
  );

export const markWasted = async (pantry_item_id, wasted_qty) =>
  axios.put(
    `${BASE_URL}/mark_wasted`,
    { pantry_item_id, wasted_qty },
    { headers: await getHeaders() },
  );

export const markConsumed = async (pantry_item_id) =>
  axios.put(
    `${BASE_URL}/mark_consumed`,
    { pantry_item_id },
    { headers: await getHeaders() },
  );

// Shopping List
export const getShoppingList = async () =>
  axios.get(`${BASE_URL}/get_shopping_list`, { headers: await getHeaders() });

export const generateShoppingList = async ({ lat, lon, temp } = {}) => {
  const params = {};
  if (lat != null && lon != null) { params.lat = lat; params.lon = lon; }
  if (temp != null) params.temp = temp;
  return axios.get(`${BASE_URL}/generate_shopping_list`, {
    headers: await getHeaders(),
    params,
  });
};

export const markAsBought = async (shopping_item_id) =>
  axios.put(
    `${BASE_URL}/mark_as_bought`,
    { shopping_item_id },
    { headers: await getHeaders() },
  );

export const deleteShoppingItem = async (shopping_item_id) =>
  axios.delete(`${BASE_URL}/delete_shopping_item`, {
    headers: await getHeaders(),
    data: { shopping_item_id },
  });

// Family Info
export const getFamilyInfo = async () =>
  axios.get(`${BASE_URL}/get_family_info`, { headers: await getHeaders() });

export const updateFamilyInfo = async (data) =>
  axios.put(`${BASE_URL}/update_family_info`, data, { headers: await getHeaders() });
