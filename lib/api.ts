type ApiOptions = RequestInit & {
  token?: string;
};

function getCookieToken() {
  if (typeof document === "undefined") {
    return "";
  }

  const tokenCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("token="));

  return tokenCookie ? decodeURIComponent(tokenCookie.split("=")[1]) : "";
}

function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("token") || getCookieToken();
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const token = options.token || getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
