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
 * List received payments for a lead.
 * GET /api/venues/{venueId}/leads/{leadId}/payments
 */
export async function listPayments(venueId, leadId, token) {
  const res = await axios.get(`${base(venueId, leadId)}/payments`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * Record a received payment.
 * POST /api/venues/{venueId}/leads/{leadId}/payments
 * Body: {
 *   amount,
 *   method: 'cash'|'account',
 *   receivedAt?,
 *   receivedByName?,
 *   givenByName?,
 *   notes?,
 *   reminderId?
 * }
 */
export async function createPayment(venueId, leadId, payload, token) {
  const res = await axios.post(`${base(venueId, leadId)}/payments`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * Update a payment (edit flow).
 * PATCH /api/venues/{venueId}/leads/{leadId}/payments/{paymentId}
 */
export async function updatePayment(
  venueId,
  leadId,
  paymentId,
  payload,
  token,
) {
  const res = await axios.patch(
    `${base(venueId, leadId)}/payments/${paymentId}`,
    payload,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Delete a payment.
 * DELETE /api/venues/{venueId}/leads/{leadId}/payments/{paymentId}
 */
export async function deletePayment(venueId, leadId, paymentId, token) {
  const res = await axios.delete(
    `${base(venueId, leadId)}/payments/${paymentId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

/**
 * Confirm a received payment with notes.
 * PATCH /api/venues/{venueId}/leads/{leadId}/payments/{paymentId}/confirm
 * Body: {
 *   confirmedNotes?: string
 * }
 */
export async function confirmPayment(
  venueId,
  leadId,
  paymentId,
  payload,
  token,
) {
  const res = await axios.patch(
    `${base(venueId, leadId)}/payments/${paymentId}/confirm`,
    payload,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Confirm/Mark advance as received.
 * PATCH /api/events/{eventId}/advances/{advanceNumber}/confirm
 * Body: {
 *   status: 'received'
 * }
 */
export async function confirmAdvance(eventId, advanceNumber, token) {
  const res = await axios.patch(
    `${API_BASE_URL}events/${eventId}/advances/${advanceNumber}/confirm`,
    { status: "received" },
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}
