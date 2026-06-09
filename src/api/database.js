import axios from "axios";
import { API_BASE_URL } from "../../config";

const BASE = `${API_BASE_URL}database/venues`;

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

export function getApiErrorMessage(err, fallback = "Something went wrong.") {
  return (
    err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

/**
 * List database venue entries.
 * GET /api/database/venues?search=&venueId=
 */
export async function listDatabaseVenueEntries(token, params = {}) {
  const query = {};
  if (params.search) query.search = params.search;
  if (params.venueId) query.venueId = params.venueId;

  const res = await axios.get(BASE, {
    headers: authHeaders(token),
    params: Object.keys(query).length > 0 ? query : undefined,
  });
  const data = unwrapData(res);
  return Array.isArray(data) ? data : [];
}

/**
 * Get a single database venue entry.
 * GET /api/database/venues/{id}
 */
export async function getDatabaseVenueEntry(id, token) {
  const res = await axios.get(`${BASE}/${id}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * Create a database venue entry.
 * POST /api/database/venues
 */
export async function createDatabaseVenueEntry(payload, token) {
  const res = await axios.post(BASE, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * Update a database venue entry.
 * PUT /api/database/venues/{id}
 */
export async function updateDatabaseVenueEntry(id, payload, token) {
  const res = await axios.put(`${BASE}/${id}`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * Delete a database venue entry.
 * DELETE /api/database/venues/{id}
 */
export async function deleteDatabaseVenueEntry(id, token) {
  const res = await axios.delete(`${BASE}/${id}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// Database contacts (categories + entries)
//
// Endpoints (from your schema reference):
// - GET/POST/PUT/DELETE /api/database/categories
// - GET/POST/PUT/DELETE /api/database
// ─────────────────────────────────────────────────────────────────────────────

const BASE_CONTACTS = `${API_BASE_URL}database`;
const BASE_CATEGORIES = `${API_BASE_URL}database/categories`;

export async function getDatabaseCategories(token, { venueId } = {}) {
  const res = await axios.get(BASE_CATEGORIES, {
    headers: authHeaders(token),
    params: venueId ? { venueId } : undefined,
  });
  const data = unwrapData(res);
  return Array.isArray(data) ? data : [];
}

export async function createDatabaseCategory(payload, token) {
  const res = await axios.post(BASE_CATEGORIES, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  const data = unwrapData(res);
  return data;
}

export async function updateDatabaseCategory(categoryId, payload, token) {
  const res = await axios.put(`${BASE_CATEGORIES}/${categoryId}`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  const data = unwrapData(res);
  return data;
}

export async function deleteDatabaseCategory(categoryId, token) {
  const res = await axios.delete(`${BASE_CATEGORIES}/${categoryId}`, {
    headers: authHeaders(token),
  });
  const data = unwrapData(res);
  return data;
}

export async function getDatabaseEntry(entryId, token) {
  const res = await axios.get(`${BASE_CONTACTS}/${entryId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function listDatabaseEntries(token, params = {}) {
  const query = {};
  if (params.search) query.search = params.search;
  if (params.categoryId) query.categoryId = params.categoryId;
  if (params.venueId) query.venueId = params.venueId;

  const res = await axios.get(BASE_CONTACTS, {
    headers: authHeaders(token),
    params: Object.keys(query).length > 0 ? query : undefined,
  });
  const data = unwrapData(res);
  // Some backends wrap in { items: [] }.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export async function createDatabaseEntry(payload, token) {
  const res = await axios.post(BASE_CONTACTS, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

export async function updateDatabaseEntry(entryId, payload, token) {
  const res = await axios.put(`${BASE_CONTACTS}/${entryId}`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

export async function deleteDatabaseEntry(entryId, token) {
  const res = await axios.delete(`${BASE_CONTACTS}/${entryId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}
