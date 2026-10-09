"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import FileForm from "@/components/FileForm";
import FileIcon from "@/components/FileIcon";
import { api } from "@/lib/api";
import { getRole } from "@/lib/auth";
import { fileUrl, formatDate, isImage, stripHtml } from "@/lib/files";
import type { FileItem } from "@/lib/types";

export default function FileListPage() {
  const [files, setFiles] = useState<FileItem[] | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => setIsUser(getRole() === "user"), []);

  const load = useCallback(() => {
    api<FileItem[]>("/files")
      .then((f) => setFiles([...f].reverse()))
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 text-[44px]">File</h1>
        {/* only users upload; admins can view and delete */}
        {isUser && <button className="btn btn-primary" onClick={() => setUploading(true)}>Upload</button>}
      </header>
      {error && <p className="m-0 text-sm text-[#a63a2a]">{error}</p>}

      <div className="flex flex-col gap-2">
        {files?.map((f) => (
          <Link
            key={f.id}
            href={`/file/${f.id}/edit`}
            className="flex items-center gap-4 rounded-[20px] bg-neutral-100 p-4 hover:bg-neutral-200"
          >
            {isImage(f.filename) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl(f)} alt={f.name} className="washed h-16 w-16 flex-none rounded-2xl object-cover" />
            ) : (
              <FileIcon filename={f.filename} size={64} />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-semibold">{f.name}</span>
              <span className="truncate text-[13px] text-neutral-700">{stripHtml(f.detail) || "No detail"}</span>
              <span className="text-xs text-neutral-700">{f.filename} · by {f.userName ?? "admin (legacy)"} · {formatDate(f.createdAt)}</span>
            </div>
            <span className="tag tag-accent">Open</span>
          </Link>
        ))}
        {files && files.length === 0 && <p className="m-0 p-6 text-neutral-700">{isUser ? "No files yet. Use Upload to add one." : "No files yet."}</p>}
      </div>

      {uploading && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <div className="dialog dialog-wide">
            <h3 className="m-0 text-2xl">Upload file</h3>
            <FileForm
              submitLabel="Upload"
              onCancel={() => setUploading(false)}
              onSaved={() => {
                setUploading(false);
                load();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
