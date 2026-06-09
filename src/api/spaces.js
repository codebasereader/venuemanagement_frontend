import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

const RACK_RATE_KEYS = ["12", "24", "36", "48"];

export function normalizeRackRates(rates) {
  const source = rates && typeof rates === "object" ? rates : {};
  const next = {};

  RACK_RATE_KEYS.forEach((key) => {
    const raw = source[key];
    if (raw == null || raw === "") return;
    const num = Number(raw);
    if (!Number.isNaN(num) && num >= 0) next[key] = num;
  });

  return next;
}

function normalizeSpacePayload(payload = {}) {
  const body = { ...payload };
  const mergedRates = {
    ...(payload.prices && typeof payload.prices === "object" ? payload.prices : {}),
    ...(payload.rackRates && typeof payload.rackRates === "object" ? payload.rackRates : {}),
  };
  const normalizedRates = normalizeRackRates(mergedRates);

  if (Object.keys(normalizedRates).length > 0) {
    body.rackRates = normalizedRates;
  } else {
    // Explicit empty map prevents backend defaults (e.g. "" per duration) from failing validation.
    body.rackRates = {};
  }

  delete body.prices;

  return body;
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
    normalizeSpacePayload(payload),
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

export async function updateSpace(token, venueId, spaceId, payload) {
  const res = await axios.patch(
    `${API_BASE_URL}venues/${venueId}/spaces/${spaceId}`,
    normalizeSpacePayload(payload),
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
