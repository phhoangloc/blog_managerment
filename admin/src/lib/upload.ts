import { api } from "./api";
import type { FileItem } from "./types";

// Stores a file through the files API under a generated unique name
export async function uploadFile(file: File, detail: string): Promise<FileItem> {
  const form = new FormData();
  form.set("name", `${detail.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`);
  form.set("detail", detail);
  form.set("file", file);
  return api<FileItem>("/files", { method: "POST", body: form });
}
