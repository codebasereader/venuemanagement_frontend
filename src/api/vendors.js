import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

const base = (venueId) => `${API_BASE_URL}venues/${venueId}/vendors`;

/**
 * List vendors for a venue.
 * GET /api/venues/{venueId}/vendors
 */
export async function listVendors(venueId, token) {
  const res = await axios.get(base(venueId), {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * Create a vendor.
 * POST /api/venues/{venueId}/vendors
 * Body: { name (required), category?, contactName?, phone?, email?, notes? }
 */
export async function createVendor(venueId, payload, token) {
  const res = await axios.post(base(venueId), payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * Get a single vendor.
 * GET /api/venues/{venueId}/vendors/{vendorId}
 */
export async function getVendor(venueId, vendorId, token) {
  const res = await axios.get(`${base(venueId)}/${vendorId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * Update a vendor.
 * PATCH /api/venues/{venueId}/vendors/{vendorId}
 */
export async function updateVendor(venueId, vendorId, payload, token) {
  const res = await axios.patch(`${base(venueId)}/${vendorId}`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * Delete a vendor.
 * DELETE /api/venues/{venueId}/vendors/{vendorId}
 */
export async function deleteVendor(venueId, vendorId, token) {
  const res = await axios.delete(`${base(venueId)}/${vendorId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

