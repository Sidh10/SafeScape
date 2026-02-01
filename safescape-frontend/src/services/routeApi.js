import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

/**
 * Address-based safest route
 * Calls: POST /route/safe_route_by_address
 */
export const fetchSafeRouteByAddress = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/route/safe_route_by_address`,
    payload
  );
  return response.data;
};
