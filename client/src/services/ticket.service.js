import { apiRequest } from "./apiClient";


export const ticketService = {
  list: (token) => apiRequest("/tickets", {}, token),
  create: (body, token) =>
    apiRequest("/tickets", { method: "POST", body: JSON.stringify(body) }, token),
  messages: (ticketId, token) => apiRequest(`/tickets/${ticketId}/messages`, {}, token),
  addMessage: (ticketId, content, token) =>
    apiRequest(
      `/tickets/${ticketId}/messages`,
      { method: "POST", body: JSON.stringify({ content }) },
      token
    ),
  updateStatus: (ticketId, status, token) =>
    apiRequest(
      `/tickets/${ticketId}/status`,
      { method: "PUT", body: JSON.stringify({ status }) },
      token
    ),
};
