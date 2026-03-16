import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * Religious calendar is global (not venue-scoped). Same auspicious days for all venues.
 * Base path: /api/calendar-days
 */

/**
 * List calendar days with optional filters.
 * GET /api/calendar-days
 * @param {string} token - Auth token
 * @param {{ religion?: string, type?: string, year?: number, month?: number }} params - Optional filters
 */
export async function listCalendarDays(token, params = {}) {
  const { religion, type, year, month } = params;
  const query = {};
  if (religion != null) query.religion = religion;
  if (type != null) query.type = type;
  if (year != null) query.year = year;
  if (month != null) query.month = month;
  const res = await axios.get(`${API_BASE_URL}calendar-days`, {
    headers: authHeaders(token),
    params: Object.keys(query).length ? query : undefined,
  });
  return unwrapData(res);
}

/**
 * Create a single calendar day.
 * POST /api/calendar-days
 * Body: { religion, type, date } (no venueId)
 */
export async function createCalendarDay(payload, token) {
  const res = await axios.post(
    `${API_BASE_URL}calendar-days`,
    payload,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Bulk create calendar days.
 * POST /api/calendar-days/bulk
 * Body: { items: [{ religion, type, date }, ...] } (no venueId)
 */
export async function createCalendarDaysBulk(items, token) {
  const res = await axios.post(
    `${API_BASE_URL}calendar-days/bulk`,
    { items },
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Update a calendar day.
 * PATCH /api/calendar-days/{id}
 */
export async function updateCalendarDay(id, payload, token) {
  const res = await axios.patch(
    `${API_BASE_URL}calendar-days/${id}`,
    payload,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Delete a calendar day.
 * DELETE /api/calendar-days/{id}
 */
export async function deleteCalendarDay(id, token) {
  const res = await axios.delete(
    `${API_BASE_URL}calendar-days/${id}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}
