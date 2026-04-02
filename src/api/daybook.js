import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getDaybookData = async (venueId, token, params) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}venues/${venueId}/daybook`,
      {
        headers: authHeaders(token),
        params,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
