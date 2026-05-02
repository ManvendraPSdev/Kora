import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:3000/api/v1" : "/api/v1");

const STORAGE_KEY = "support-platform-auth";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      /* ignore */
    }
  }
  return config;
});

let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const reqUrl = typeof originalRequest?.url === "string" ? originalRequest.url : "";
    const skipRefresh =
      reqUrl.includes("/auth/login") ||
      reqUrl.includes("/auth/register") ||
      reqUrl.includes("/auth/forgot-password") ||
      reqUrl.includes("/auth/reset-password") ||
      reqUrl.includes("/auth/refresh");
    if (skipRefresh || error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const res = await refreshPromise;
      const accessToken = res.data?.data?.accessToken;
      if (accessToken) {
        const existing = localStorage.getItem(STORAGE_KEY);
        const parsed = existing ? JSON.parse(existing) : {};
        parsed.token = accessToken;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
