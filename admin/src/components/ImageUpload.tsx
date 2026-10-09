"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import { isImage } from "@/lib/files";
import FileIcon from "./FileIcon";

interface Props {
  /** Already-stored file (edit mode): shown until a new file is chosen */
  current?: { url: string; filename: string };
  file: File | null;
  onChange: (file: File | null) => void;
  /** e.g. "image/*" to restrict the file picker */
  accept?: string;
  /** Compact variant for avatars */
  compact?: boolean;
}

// Upload box that accepts drag-and-drop or a click to browse
export default function ImageUpload({ current, file, onChange, accept, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file && isImage(file.name)) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [file]);

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onChange(dropped);
  }

  const shownImage = preview ?? (!file && current && isImage(current.filename) ? current.url : null);
  const shownName = file?.name ?? (!file ? current?.filename : undefined);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload file: drop here or click to browse"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`flex ${compact ? "min-h-[120px]" : "min-h-[200px]"} cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border-2 border-dashed bg-white p-4 text-center text-sm text-neutral-700 transition-colors ${
        dragging ? "border-accent bg-accent-100" : "border-neutral-400 hover:border-accent"
      }`}
    >
      {shownImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shownImage} alt="Preview" className="washed max-h-[220px] rounded-2xl object-contain" />
      ) : shownName ? (
        <FileIcon filename={shownName} size={72} />
      ) : (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m17 8-5-5-5 5" />
          <path d="M12 3v12" />
        </svg>
      )}
      <span>{shownName ?? "Drag & drop a file here, or click to browse"}</span>
      {shownName && <span className="text-xs">Drop or click to replace</span>}
      <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </div>
  );
}
