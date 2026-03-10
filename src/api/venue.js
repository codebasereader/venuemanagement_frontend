import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

export async function listVenues(token) {
  const res = await axios.get(`${API_BASE_URL}venues`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function getVenueById(venueId, token) {
  const res = await axios.get(`${API_BASE_URL}venues/${venueId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function createVenue(payload, token) {
  const res = await axios.post(`${API_BASE_URL}venues`, payload, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function updateVenue(venueId, payload, token) {
  const res = await axios.patch(`${API_BASE_URL}venues/${venueId}`, payload, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function deleteVenue(venueId, token) {
  const res = await axios.delete(`${API_BASE_URL}venues/${venueId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

