import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

/* Smaller default bounds (central Pune) */
const DEFAULT_BOUNDS = {
  min_lat: 18.48,
  max_lat: 18.62,
  min_lon: 73.78,
  max_lon: 73.95,
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 🔑 20 seconds (important)
});

export const fetchCrimes = async (bounds = DEFAULT_BOUNDS) => {
  try {
    const response = await api.get("/crimes/", {
      params: {
        min_lat: bounds.min_lat,
        max_lat: bounds.max_lat,
        min_lon: bounds.min_lon,
        max_lon: bounds.max_lon,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching crimes:",
      error?.response?.data || error.message
    );

    // ✅ Fail soft (map still renders)
    return [];
  }
};
