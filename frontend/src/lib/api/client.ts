import { useAuthStore } from "@/stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean; // attach the customer access token
}

/**
 * Thin fetch wrapper — every product/order/customer call in lib/api/*.api.ts
 * goes through this so there's exactly one place that knows about the base
 * URL, auth header, and the backend's { data } response envelope
 * (see shared/interceptors/response.interceptor.ts on the backend).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = json?.message || json?.error || `Request failed with ${res.status}`;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(", ") : message);
  }

  // Backend wraps successful responses as { success, data }; unwrap when present.
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}
