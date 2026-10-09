import { API_URL } from "./api";
import type { FileItem } from "./types";

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"];

export const extOf = (filename: string) => filename.split(".").pop()?.toLowerCase() ?? "";
export const isImage = (filename: string) => IMAGE_EXT.includes(extOf(filename));
export const fileUrl = (f: Pick<FileItem, "url">) => `${API_URL}${f.url}`;

export const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

// 08.10.2026 (DD.MM.YYYY)
export const formatDateDots = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};
