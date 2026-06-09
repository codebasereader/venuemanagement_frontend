import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function buildDaybookDateParams(startDate, endDate) {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return params;
}

export const getDaybookData = async (venueId, token, params) => {
  const response = await axios.get(
    `${API_BASE_URL}venues/${venueId}/daybook`,
    {
      headers: authHeaders(token),
      params,
    },
  );
  return response.data;
};

export const getDaybookList = async (venueId, token, params) => {
  const response = await axios.get(
    `${API_BASE_URL}venues/${venueId}/daybook/list`,
    {
      headers: authHeaders(token),
      params,
    },
  );
  return response.data;
};
