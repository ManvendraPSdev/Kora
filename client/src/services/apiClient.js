// Dev: call the API directly (one request to :3000). Prod: same-origin /api/v1 (e.g. nginx → server).
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:3000/api/v1" : "/api/v1");

  
async function apiRequest(path, options = {}, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload.data;
}

export { API_BASE_URL, apiRequest };
