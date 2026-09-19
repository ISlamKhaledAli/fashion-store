import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const isServer = typeof window === "undefined";
const defaultBaseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: isServer ? defaultBaseURL : "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Dedicated instance for token refresh to avoid catching interceptors
const refreshAxios = axios.create({
  baseURL: isServer ? defaultBaseURL : "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Attach client correlation ID for end-to-end tracing
api.interceptors.request.use((config) => {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID &&
    !config.headers["X-Request-ID"]
  ) {
    config.headers["X-Request-ID"] = crypto.randomUUID();
  }
  return config;
});

// Response Interceptor for Token Refresh and Error Tracing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const traceId =
      error.config?.headers?.["X-Request-ID"] ||
      error.response?.headers?.["x-request-id"];
    if (traceId && error.response?.status >= 500) {
      console.error(
        `[API Error | Trace ID: ${traceId}]`,
        error.response?.data || error.message
      );
    }
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
            window.location.href =
              "/login?redirect=" + encodeURIComponent(currentPath);
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
