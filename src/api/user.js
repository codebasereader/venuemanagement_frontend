import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  // Backend seems to respond as { success, data }
  return response?.data?.data ?? response?.data;
}

export async function listUsers(token) {
  const res = await axios.get(`${API_BASE_URL}users`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function getUserById(userId, token) {
  const res = await axios.get(`${API_BASE_URL}users/${userId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function createUser(payload, token) {
  const res = await axios.post(`${API_BASE_URL}users`, payload, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function updateUser(userId, payload, token) {
  const res = await axios.patch(`${API_BASE_URL}users/${userId}`, payload, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function deleteUser(userId, token) {
  const res = await axios.delete(`${API_BASE_URL}users/${userId}`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

export async function blockUser(userId, token) {
  const res = await axios.post(
    `${API_BASE_URL}users/${userId}/block`,
    {},
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

export async function unblockUser(userId, token) {
  const res = await axios.post(
    `${API_BASE_URL}users/${userId}/unblock`,
    {},
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

