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
 * List payment reminders for a lead.
 * GET /api/venues/{venueId}/leads/{leadId}/payment-reminders
 */
export async function listReminders(venueId, leadId, token) {
  const res = await axios.get(`${base(venueId, leadId)}/payment-reminders`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * Create a payment reminder.
 * POST /api/venues/{venueId}/leads/{leadId}/payment-reminders
 * Body: { expectedAmount, expectedDate }
 */
export async function createReminder(venueId, leadId, payload, token) {
  const res = await axios.post(
    `${base(venueId, leadId)}/payment-reminders`,
    payload,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Update a payment reminder.
 * PATCH /api/venues/{venueId}/leads/{leadId}/payment-reminders/{reminderId}
 */
export async function updateReminder(venueId, leadId, reminderId, payload, token) {
  const res = await axios.patch(
    `${base(venueId, leadId)}/payment-reminders/${reminderId}`,
    payload,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Delete a payment reminder.
 * DELETE /api/venues/{venueId}/leads/{leadId}/payment-reminders/{reminderId}
 */
export async function deleteReminder(venueId, leadId, reminderId, token) {
  const res = await axios.delete(
    `${base(venueId, leadId)}/payment-reminders/${reminderId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}
