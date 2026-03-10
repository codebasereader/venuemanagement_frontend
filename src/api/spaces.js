import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * Spaces per venue (API.md 229-298)
 * POST   /api/venues/{venueId}/spaces
 * GET    /api/venues/{venueId}/spaces
 * GET    /api/venues/{venueId}/spaces/{spaceId}
 * PATCH  /api/venues/{venueId}/spaces/{spaceId}
 * DELETE /api/venues/{venueId}/spaces/{spaceId}
 */

export async function listSpaces(token, venueId) {
  const res = await axios.get(`${API_BASE_URL}venues/${venueId}/spaces`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function getSpace(token, venueId, spaceId) {
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/spaces/${spaceId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

export async function createSpace(token, venueId, payload) {
  const res = await axios.post(
    `${API_BASE_URL}venues/${venueId}/spaces`,
    payload,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

export async function updateSpace(token, venueId, spaceId, payload) {
  const res = await axios.patch(
    `${API_BASE_URL}venues/${venueId}/spaces/${spaceId}`,
    payload,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

export async function deleteSpace(token, venueId, spaceId) {
  const res = await axios.delete(
    `${API_BASE_URL}venues/${venueId}/spaces/${spaceId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}
