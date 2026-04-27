import { apiRequest } from "./apiClient";

export const userService = {
  list: (token) => apiRequest("/users", {}, token),
  create: (body, token) =>
    apiRequest("/users", { method: "POST", body: JSON.stringify(body) }, token),
};
