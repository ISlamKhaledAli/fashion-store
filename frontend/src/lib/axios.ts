import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Dedicated instance for token refresh to avoid catching interceptors
const refreshAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Dynamically get the latest token from the store for every request
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          // Attempt to refresh the tokens using the dedicated instance
          const { data } = await refreshAxios.post("/auth/refresh", {
            refreshToken,
          });

          // Backend returns success: true, data: { accessToken }
          const newAccessToken = data.data.accessToken;
          
          // Update the store state directly
          useAuthStore.setState({ accessToken: newAccessToken, isAuthenticated: true });

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout and redirect to login
          logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available
        logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
