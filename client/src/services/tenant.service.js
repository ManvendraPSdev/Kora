import { apiRequest } from "./apiClient";

export const tenantService = {
  list: (token) => apiRequest("/tenant", {}, token),
};
