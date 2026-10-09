import type { Blog } from "./types";

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
