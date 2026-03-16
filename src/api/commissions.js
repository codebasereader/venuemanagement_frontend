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
 * List commissions for a lead.
 * GET /api/venues/{venueId}/leads/{leadId}/commissions
 */
export async function listCommissions(venueId, leadId, token) {
  const res = await axios.get(`${base(venueId, leadId)}/commissions`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * Create a commission entry (inflow or outflow).
 * POST /api/venues/{venueId}/leads/{leadId}/commissions
 * Body: { direction: 'outflow'|'inflow', vendorName, amount, method, givenDate, notes? }
 */
export async function createCommission(venueId, leadId, payload, token) {
  const res = await axios.post(
    `${base(venueId, leadId)}/commissions`,
    payload,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Update a commission entry.
 * PATCH /api/venues/{venueId}/leads/{leadId}/commissions/{commissionId}
 */
export async function updateCommission(
  venueId,
  leadId,
  commissionId,
  payload,
  token,
) {
  const res = await axios.patch(
    `${base(venueId, leadId)}/commissions/${commissionId}`,
    payload,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Delete a commission entry.
 * DELETE /api/venues/{venueId}/leads/{leadId}/commissions/{commissionId}
 */
export async function deleteCommission(venueId, leadId, commissionId, token) {
  const res = await axios.delete(
    `${base(venueId, leadId)}/commissions/${commissionId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

