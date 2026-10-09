"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import FileForm from "@/components/FileForm";
import { api } from "@/lib/api";
import type { FileItem } from "@/lib/types";

export default function FileEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [file, setFile] = useState<FileItem | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<FileItem>(`/files/${id}`)
      .then(setFile)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function remove() {
    setBusy(true);
    try {
      await api(`/files/${id}`, { method: "DELETE" });
      router.replace("/file");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setConfirming(false);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/file" className="btn btn-ghost self-start">← File</Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="m-0 text-[44px]">Edit file</h1>
          <div className="flex items-center gap-2">
            {saved && <span className="tag tag-sage">Saved</span>}
            <button className="btn btn-secondary" onClick={() => setConfirming(true)} disabled={!file}>Delete file</button>
          </div>
        </div>
      </div>

      {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}

      {file && (
        <div className="card max-w-[760px]">
          <FileForm
            key={file.filename + file.id}
            initial={file}
            submitLabel="Save changes"
            onSaved={(f) => {
              setFile(f);
              setSaved(true);
            }}
          />
        </div>
      )}

      {confirming && file && (
        <ConfirmDialog
          title="Delete file?"
          message={`"${file.name}" and its stored file will be permanently deleted.`}
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
