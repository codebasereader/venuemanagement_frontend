import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

const base = (venueId) => `${API_BASE_URL}venues/${venueId}/bills`;

/**
 * List all bills for a venue.
 * GET /api/venues/{venueId}/bills
 */
export async function listBills(venueId, token) {
  const res = await axios.get(base(venueId), { headers: authHeaders(token) });
  return unwrapData(res);
}

/**
 * Create a new bill.
 * POST /api/venues/{venueId}/bills
 * Body: { name, emiType, emiDate, emi_end_date, defaultAmount }
 */
export async function createBill(venueId, payload, token) {
  const res = await axios.post(base(venueId), payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * Update a bill.
 * PATCH /api/venues/{venueId}/bills/{billId}
 */
export async function updateBill(venueId, billId, payload, token) {
  const res = await axios.patch(`${base(venueId)}/${billId}`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * Upsert EMI month status (mark paid / update payment).
 * PATCH /api/venues/{venueId}/bills/{billId}/emi-status
 * Body: { month, year, emiAmount, paid, amountPaid, paymentMode, paymentDate, remarks }
 */
export async function upsertEmiStatus(venueId, billId, payload, token) {
  const res = await axios.patch(
    `${base(venueId)}/${billId}/emi-status`,
    payload,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Soft-delete a bill.
 * DELETE /api/venues/{venueId}/bills/{billId}
 */
export async function deleteBill(venueId, billId, token) {
  const res = await axios.delete(`${base(venueId)}/${billId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}
