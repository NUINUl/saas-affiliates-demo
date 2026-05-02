const TOKEN_KEY = "affiliate_jwt";

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base || base.trim() === "") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Point it at your Laravel API (e.g. http://localhost:8000)."
    );
  }
  return base.replace(/\/+$/, "");
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export { TOKEN_KEY };

export async function apiFetch(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<Response> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const needsJsonBody =
    init.body !== undefined &&
    !(init.body instanceof FormData) &&
    !(init.body instanceof Blob) &&
    !headers.has("Content-Type");

  if (needsJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  const token =
    init.token !== undefined ? init.token : typeof window !== "undefined"
      ? getStoredToken()
      : null;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });
}
