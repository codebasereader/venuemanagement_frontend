import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * GET /api/venues/{venueId}/business-plan?month=5&year=2026
 * Returns the saved plan rows + computed actual data for that month.
 */
export async function getMonthlyPlan(token, venueId, month, year) {
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/business-plan`,
    {
      headers: authHeaders(token),
      params: { month, year },
    },
  );
  return unwrapData(res);
}

/**
 * POST /api/venues/{venueId}/business-plan
 * Upsert (create or replace) the plan for a given month+year.
 * Body: { month, year, rows: [{ rowType, spaceId, spaceName, expectedBookings, expectedBusiness, expectedExpenses }] }
 * Returns the full updated document with computed actual data.
 */
export async function upsertMonthlyPlan(token, venueId, payload) {
  const res = await axios.post(
    `${API_BASE_URL}venues/${venueId}/business-plan`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
    },
  );
  return unwrapData(res);
}

/**
 * GET /api/venues/{venueId}/business-plan/yearly?year=2026
 * Returns aggregated monthly totals for the full year.
 * Response: array of { month, totalExpectedBookings, totalExpectedBusiness,
 *   totalExpectedExpenses, totalActualBookings, totalActualBusiness, totalActualExpenses }
 */
export async function getYearlyPlan(token, venueId, year) {
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/business-plan/yearly`,
    {
      headers: authHeaders(token),
      params: { year },
    },
  );
  return unwrapData(res);
}
