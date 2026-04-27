import { apiRequest } from "./apiClient";

export const kbService = {
  list: (token) => apiRequest("/kb", {}, token),
  create: (body, token) => apiRequest("/kb", { method: "POST", body: JSON.stringify(body) }, token),
};
