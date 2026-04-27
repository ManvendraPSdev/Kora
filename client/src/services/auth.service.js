import { apiRequest } from "./apiClient";

export const authService = {
  login: (body) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) =>
    apiRequest("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  logout: (token) => apiRequest("/auth/logout", { method: "POST" }, token),
  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (body) =>
    apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
};
