import type { Blog, BlogComment } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

// Cover urls from the backend may be relative (/public/upload/x.png)
export const assetUrl = (url: string | null) =>
  url ? (/^https?:\/\//.test(url) ? url : `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`) : null;

export async function getBlogs(): Promise<Blog[]> {
  const res = await fetch(`${API_URL}/api/public/blogs`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Cannot load blogs (${res.status})`);
  return res.json();
}

export async function getBlog(slug: string): Promise<Blog | null> {
  const res = await fetch(`${API_URL}/api/public/blogs/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Cannot load blog (${res.status})`);
  return res.json();
}

export async function getComments(slug: string): Promise<BlogComment[]> {
  const res = await fetch(`${API_URL}/api/public/blogs/${encodeURIComponent(slug)}/comments`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// Authenticated call from the browser; throws Error(message) with the backend error text
export async function authedFetch<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`);
  return data as T;
}
