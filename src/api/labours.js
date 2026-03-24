import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

const base = (venueId, leadId) =>
  `${API_BASE_URL}venues/${venueId}/leads/${leadId}`;

/**
 * List labour entries for a lead.
 * GET /api/venues/{venueId}/leads/{leadId}/labours
 */
export async function listLabours(venueId, leadId, token) {
  const res = await axios.get(`${base(venueId, leadId)}/labours`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * Create a labour entry.
 * POST /api/venues/{venueId}/leads/{leadId}/labours
 */
export async function createLabour(venueId, leadId, payload, token) {
  const res = await axios.post(`${base(venueId, leadId)}/labours`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * Update a labour entry.
 * PATCH /api/venues/{venueId}/leads/{leadId}/labours/{labourId}
 */
export async function updateLabour(
  venueId,
  leadId,
  labourId,
  payload,
  token,
) {
  const res = await axios.patch(
    `${base(venueId, leadId)}/labours/${labourId}`,
    payload,
    {
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
    },
  );
  return unwrapData(res);
}

/**
 * Delete a labour entry.
 * DELETE /api/venues/{venueId}/leads/{leadId}/labours/{labourId}
 */
export async function deleteLabour(venueId, leadId, labourId, token) {
  const res = await axios.delete(`${base(venueId, leadId)}/labours/${labourId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}
