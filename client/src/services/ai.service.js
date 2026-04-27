import { apiRequest } from "./apiClient";

export const aiService = {
  suggestReplies: (ticketId, token) => apiRequest(`/ai/suggest-reply/${ticketId}`, {}, token),
};
