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

export async function listLeads(venueId, token, query = {}) {
  const params = {};
  const {
    search,
    eventStatus,
    status,
    startDate,
    endDate,
    page,
    limit,
  } = query || {};

  if (search) params.search = search;
  if (eventStatus) params.eventStatus = eventStatus;
  // Keep status fallback for older consumers/backends.
  if (status) params.status = status;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (Number.isFinite(Number(page))) params.page = Number(page);
  if (Number.isFinite(Number(limit))) params.limit = Number(limit);

  const res = await axios.get(`${API_BASE_URL}venues/${venueId}/leads`, {
    headers: authHeaders(token),
    params: Object.keys(params).length > 0 ? params : undefined,
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
  const query = { ...params };
  if (query.view === "year") {
    delete query.month;
  }
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/leads/confirmed`,
    {
      headers: authHeaders(token),
      params: query,
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
  const query = { ...(params || {}) };
  if (query.view === "year") {
    delete query.month;
  }
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/leads/confirmed/stats`,
    {
      headers: authHeaders(token),
      params: query,
    },
  );
  return unwrapData(res);
}

export async function listLeadStats(venueId, token, params = {}) {
  const query = { ...params };
  if (query.view === "year") {
    delete query.month;
  }
  const res = await axios.get(`${API_BASE_URL}venues/${venueId}/leads/stats`, {
    headers: authHeaders(token),
    params: query,
  });
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
