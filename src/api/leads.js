import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

export async function createLead(venueId, payload, token) {
  const res = await axios.post(`${API_BASE_URL}venues/${venueId}/leads`, payload, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function listLeads(venueId, token, { status } = {}) {
  const res = await axios.get(`${API_BASE_URL}venues/${venueId}/leads`, {
    headers: authHeaders(token),
    params: status ? { status } : undefined,
  });
  return unwrapData(res);
}

/**
 * List confirmed leads for a venue.
 *
 * Backend route:
 *   GET /api/venues/{venueId}/leads/confirmed?bookingType=venue_buyout
 *
 * Example:
 *   listConfirmedLeads(venueId, token, { bookingType: 'space_buyout' })
 *   → will fetch only space-buyout bookings.
 */
export async function listConfirmedLeads(venueId, token, params = {}) {
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/leads/confirmed`,
    {
      headers: authHeaders(token),
      params,
    },
  );
  return unwrapData(res);
}

/**
 * Get confirmed-leads stats for a specific month/year.
 *
 * Backend route:
 *   GET /api/venues/{venueId}/leads/confirmed/stats?year=2026&month=3
 *
 * Example:
 *   listConfirmedLeadStats(venueId, token, { year: 2026, month: 3 })
 */
export async function listConfirmedLeadStats(venueId, token, params) {
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/leads/confirmed/stats`,
    {
      headers: authHeaders(token),
      params,
    },
  );
  return unwrapData(res);
}

export async function getLeadById(venueId, leadId, token) {
  const res = await axios.get(`${API_BASE_URL}venues/${venueId}/leads/${leadId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function updateLead(venueId, leadId, payload, token) {
  const res = await axios.patch(`${API_BASE_URL}venues/${venueId}/leads/${leadId}`, payload, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function deleteLead(venueId, leadId, token) {
  const res = await axios.delete(`${API_BASE_URL}venues/${venueId}/leads/${leadId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}
