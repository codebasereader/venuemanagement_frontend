import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * Contact persons (Venue)
 * POST   /api/venues/{venueId}/contact-persons
 * GET    /api/venues/{venueId}/contact-persons
 * GET    /api/venues/{venueId}/contact-persons/{contactPersonId}
 * PATCH  /api/venues/{venueId}/contact-persons/{contactPersonId}
 * DELETE /api/venues/{venueId}/contact-persons/{contactPersonId}
 */

export async function createContactPerson(token, venueId, payload) {
  const res = await axios.post(
    `${API_BASE_URL}venues/${venueId}/contact-persons`,
    payload,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

export async function listContactPersons(token, venueId) {
  const res = await axios.get(`${API_BASE_URL}venues/${venueId}/contact-persons`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function getContactPerson(token, venueId, contactPersonId) {
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/contact-persons/${contactPersonId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

export async function updateContactPerson(token, venueId, contactPersonId, payload) {
  const res = await axios.patch(
    `${API_BASE_URL}venues/${venueId}/contact-persons/${contactPersonId}`,
    payload,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

export async function deleteContactPerson(token, venueId, contactPersonId) {
  const res = await axios.delete(
    `${API_BASE_URL}venues/${venueId}/contact-persons/${contactPersonId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

