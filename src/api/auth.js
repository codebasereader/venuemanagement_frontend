import axios from "axios";
import { API_BASE_URL } from "../../config";

/**
 * Login user (Admin or Incharge)
 * POST /api/auth/login
 */
export const loginUser = async ({ email, password }) => {
  const response = await axios.post(`${API_BASE_URL}auth/login`, {
    email,
    password,
  });
  // Response shape: { success: true, data: { user: { _id, email, name, role, venueId }, token } }
  const { user, token } = response.data.data;
  return { user, token };
};

/**
 * Register a new Incharge
 * POST /api/auth/register
 */
export const registerIncharge = async ({ email, password, name, venueId }) => {
  const payload = { email, password, name };
  if (venueId) payload.venueId = venueId;

  const response = await axios.post(`${API_BASE_URL}auth/register`, payload);
  const { user, token } = response.data.data;
  return { user, token };
};

/**
 * Get currently authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_BASE_URL}auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};
