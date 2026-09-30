const API_BASE = (import.meta.env?.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, "") : "") + "/api";

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("glow_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}