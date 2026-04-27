import { apiRequest } from "./apiClient";


export const analyticsService = {
  overview: (token) => apiRequest("/analytics/overview", {}, token),
};
