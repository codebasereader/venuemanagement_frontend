import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * GET /api/venues/{venueId}/pricing
 * Returns full pricing document. Response includes `spaces` array for the venue.
 */
export async function getVenuePricing(token, venueId) {
  const res = await axios.get(`${API_BASE_URL}venues/${venueId}/pricing`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * PUT /api/venues/{venueId}/pricing
 * Full upsert: venue buyout + space buyout in one payload.
 */
export async function putVenuePricing(token, venueId, body) {
  const res = await axios.put(`${API_BASE_URL}venues/${venueId}/pricing`, body, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * PATCH /api/venues/{venueId}/pricing/venue-buyout
 * Partial update: buyoutOnly, rackRates, inclusions, addons only.
 */
export async function patchVenueBuyout(token, venueId, body) {
  const res = await axios.patch(
    `${API_BASE_URL}venues/${venueId}/pricing/venue-buyout`,
    body,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * PATCH /api/venues/{venueId}/pricing/space-buyout
 * Partial update: spaceOnly, spacePricings only.
 */
export async function patchSpaceBuyout(token, venueId, body) {
  const res = await axios.patch(
    `${API_BASE_URL}venues/${venueId}/pricing/space-buyout`,
    body,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * DELETE /api/venues/{venueId}/pricing
 * Admin only. Removes all pricing for the venue.
 */
export async function deleteVenuePricing(token, venueId) {
  const res = await axios.delete(`${API_BASE_URL}venues/${venueId}/pricing`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}
