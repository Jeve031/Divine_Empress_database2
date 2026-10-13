"use client";

export const ADMIN_TOKEN_KEY = "divine_empress_admin_token";

export function getAdminToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Headers for authenticated admin API calls. Works even inside preview iframes where cookies are blocked. */
export function adminAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extra ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/** fetch wrapper that always sends cookies + bearer token */
export async function adminFetch(url: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (!headers["Content-Type"] && options.method && options.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}
