"use client";

import { FormEvent, useState } from "react";
import { api, API_URL } from "@/lib/api";
import type { FileItem } from "@/lib/types";
import ImageUpload from "./ImageUpload";
import RichTextBox from "./RichTextBox";

interface Props {
  /** Present in edit mode */
  initial?: FileItem;
  submitLabel: string;
  onSaved: (file: FileItem) => void;
  onCancel?: () => void;
}

const safeName = (filename: string) =>
  filename.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);

// Shared by the upload dialog (create) and /file/:id/edit (update)
export default function FileForm({ initial, submitLabel, onSaved, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [detail, setDetail] = useState(initial?.detail ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function pickFile(f: File | null) {
    setFile(f);
    if (f && !name) setName(safeName(f.name)); // suggest a name from the file
  }

  // Images added inside the rich text are stored as regular files
  async function uploadInlineImage(img: File) {
    const form = new FormData();
    form.set("name", `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`);
    form.set("detail", "Inline image");
    form.set("file", img);
    const created = await api<FileItem>("/files", { method: "POST", body: form });
    return `${API_URL}${created.url}`;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!initial && !file) return setError("Please choose a file to upload");
    setBusy(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("detail", detail);
      if (file) form.set("file", file);
      const saved = initial
        ? await api<FileItem>(`/files/${initial.id}`, { method: "PUT", body: form })
        : await api<FileItem>("/files", { method: "POST", body: form });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="field">
        <label>File</label>
        <ImageUpload file={file} onChange={pickFile} current={initial && { url: `${API_URL}${initial.url}`, filename: initial.filename }} />
      </div>
      <div className="field">
        <label htmlFor="file-name">Name (letters, digits, - and _; used for the URL)</label>
        <input id="file-name" className="input" value={name} onChange={(e) => setName(e.target.value)} pattern="[A-Za-z0-9_\-]{1,100}" required />
      </div>
      <div className="field">
        <label>Detail</label>
        <RichTextBox value={detail} onChange={setDetail} onUploadImage={uploadInlineImage} />
      </div>
      {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
        )}
      </div>
    </form>
  );
}
