const KEY = "admin_token";
const ROLE_KEY = "admin_role";

export type Role = "admin" | "user";

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function getRole(): Role | null {
  try {
    const role = localStorage.getItem(ROLE_KEY);
    return role === "admin" || role === "user" ? role : null;
  } catch {
    return null;
  }
}

// The cookie lets middleware.ts guard routes; localStorage is what the API client reads.
export function setToken(token: string, role: Role) {
  localStorage.setItem(KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  document.cookie = `${KEY}=${token}; path=/; SameSite=Lax`;
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(ROLE_KEY);
  } catch {
    /* ignore */
  }
  document.cookie = `${KEY}=; path=/; max-age=0`;
}

export const AUTH_COOKIE = KEY;
