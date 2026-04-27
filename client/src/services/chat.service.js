import { apiRequest } from "./apiClient";

export const chatService = {
  startSession: (token) => apiRequest("/chat/session", { method: "POST" }, token),
  sendMessage: (sessionId, content, token) =>
    apiRequest(
      `/chat/session/${sessionId}/message`,
      { method: "POST", body: JSON.stringify({ content }) },
      token
    ),
};
