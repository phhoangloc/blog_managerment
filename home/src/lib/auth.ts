"use client";

import { useEffect, useState } from "react";

const KEY = "home_token";
const EVENT = "home-auth";

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

const notify = () => window.dispatchEvent(new Event(EVENT));

export function setToken(token: string) {
  try {
    localStorage.setItem(KEY, token);
  } catch {}
  notify();
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  notify();
}

// the token payload is { id, role, exp }; only used for display decisions (the backend checks the signature)
export function readToken(token: string | null): { id: number; role: string } | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) return null;
    return { id: Number(payload.id), role: String(payload.role) };
  } catch {
    return null;
  }
}

// token + logged-in user id, kept in sync across tabs and components
export function useAuth() {
  const [state, setState] = useState<{ ready: boolean; token: string | null; userId: number | null }>({
    ready: false,
    token: null,
    userId: null,
  });

  useEffect(() => {
    const sync = () => {
      const token = getToken();
      const user = readToken(token);
      if (token && !user) clearToken(); // expired
      setState({ ready: true, token: user ? token : null, userId: user && user.role === "user" ? user.id : null });
    };
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}
