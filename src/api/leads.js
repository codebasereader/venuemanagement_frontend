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
