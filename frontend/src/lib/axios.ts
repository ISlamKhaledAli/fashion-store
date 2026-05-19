import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Dedicated instance for token refresh to avoid catching interceptors
const refreshAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response Interceptor for Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { logout } = useAuthStore.getState();

      try {
        // Attempt to refresh the tokens using the dedicated instance
        // No need to pass refreshToken in body since it is stored in HttpOnly cookie
        await refreshAxios.post("/auth/refresh");

        // Retry the original request with the new cookie automatically sent
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout and redirect to login
        logout();
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          // Prevent redirect loop if already on login/register pages
          if (currentPath !== "/login" && currentPath !== "/register") {
            window.location.href = "/login?redirect=" + encodeURIComponent(currentPath);
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
