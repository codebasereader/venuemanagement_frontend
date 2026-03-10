import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * GET /api/profile/venue
 * Incharge: current venue profile
 * Admin: pass venueId query param
 */
export async function getCurrentVenueProfile(token, { venueId } = {}) {
  const res = await axios.get(`${API_BASE_URL}profile/venue`, {
    headers: authHeaders(token),
    params: venueId ? { venueId } : undefined,
  });
  return unwrapData(res);
}

/**
 * PUT /api/profile/venue
 * Upsert venue profile.
 * Admin must include venueId in body.
 */
export async function upsertVenueProfile(token, payload) {
  const res = await axios.put(`${API_BASE_URL}profile/venue`, payload, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * Contact persons are updated via PUT /api/profile/venue with { contactPersons: [...] }
 * Admin must include venueId in body.
 */
export async function upsertVenueContactPersons(token, { venueId, contactPersons }) {
  const payload = {
    ...(venueId ? { venueId } : {}),
    contactPersons: Array.isArray(contactPersons) ? contactPersons : [],
  };
  const res = await axios.put(`${API_BASE_URL}profile/venue`, payload, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * GET /api/venues/{venueId}/profile
 */
export async function getVenueProfileByVenueId(token, venueId) {
  const res = await axios.get(`${API_BASE_URL}venues/${venueId}/profile`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * PUT /api/venues/{venueId}/profile
 * (Not fully shown in API.md snippet, but commonly supported.)
 */
export async function upsertVenueProfileByVenueId(token, venueId, payload) {
  const res = await axios.put(`${API_BASE_URL}venues/${venueId}/profile`, payload, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * DELETE contact person
 * Incharge: DELETE /api/profile/venue/contact-persons/{contactPersonId}
 * Admin: DELETE /api/venues/{venueId}/profile/contact-persons/{contactPersonId}
 */
export async function deleteVenueContactPerson(token, contactPersonId) {
  const res = await axios.delete(
    `${API_BASE_URL}profile/venue/contact-persons/${contactPersonId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

export async function deleteVenueContactPersonByVenueId(token, venueId, contactPersonId) {
  const res = await axios.delete(
    `${API_BASE_URL}venues/${venueId}/profile/contact-persons/${contactPersonId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

