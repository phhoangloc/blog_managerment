"use client";

import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  /** Uploads an image and resolves with its public URL */
  onUploadImage: (file: File) => Promise<string>;
  placeholder?: string;
}

type Prompt = "link" | "image" | null;

const clean = (html: string) => DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });

// Rich text editor for long text: headings, bold/italic/underline, links, image URL and image upload
export default function RichTextBox({ value, onChange, onUploadImage, placeholder = "Write something…" }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Sync external value into the editor without clobbering the caret while typing
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value) el.innerHTML = clean(value);
  }, [value]);

  const emit = () => onChange(clean(editorRef.current?.innerHTML ?? ""));

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  }

  function exec(command: string, arg?: string) {
    restoreSelection();
    document.execCommand(command, false, arg);
    emit();
    saveSelection();
  }

  function applyPrompt() {
    const value = url.trim();
    if (value) exec(prompt === "link" ? "createLink" : "insertImage", value);
    setPrompt(null);
    setUrl("");
  }

  async function uploadImage(file: File) {
    setError("");
    setUploading(true);
    try {
      const src = await onUploadImage(file);
      exec("insertImage", src); // inserted at the saved cursor position
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  const tools: { label: string; title: string; run: () => void; cls?: string }[] = [
    ...[1, 2, 3, 4, 5].map((n) => ({ label: `H${n}`, title: `Heading ${n}`, run: () => exec("formatBlock", `h${n}`) })),
    { label: "B", title: "Bold", run: () => exec("bold"), cls: "font-bold" },
    { label: "I", title: "Italic", run: () => exec("italic"), cls: "italic" },
    { label: "U", title: "Underline", run: () => exec("underline"), cls: "underline" },
    { label: "URL", title: "Link", run: () => (saveSelection(), setPrompt("link")) },
    { label: "IMG URL", title: "Image from URL", run: () => (saveSelection(), setPrompt("image")) },
    { label: uploading ? "Uploading…" : "IMG UP", title: "Upload image", run: () => (saveSelection(), fileRef.current?.click()) },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 rounded-[24px] bg-surface p-1">
        {tools.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            disabled={uploading}
            // keep the editor selection when a toolbar button is pressed
            onMouseDown={(e) => e.preventDefault()}
            onClick={t.run}
            className={`btn btn-ghost min-w-10 !px-3 !py-1.5 text-[13px] ${t.cls ?? ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {prompt && (
        <div className="flex gap-2">
          <input
            autoFocus
            className="input"
            placeholder={prompt === "link" ? "https://example.com" : "https://example.com/image.png"}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyPrompt();
              }
              if (e.key === "Escape") setPrompt(null);
            }}
          />
          <button type="button" className="btn btn-primary" onClick={applyPrompt}>Insert</button>
          <button type="button" className="btn btn-secondary" onClick={() => setPrompt(null)}>Cancel</button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={saveSelection}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        className="rich min-h-[200px] rounded-[24px] border border-[var(--color-divider)] bg-white p-5 text-base leading-relaxed outline-none focus-visible:border-accent empty:before:text-neutral-400 empty:before:content-[attr(data-placeholder)]"
      />
      {error && <p className="m-0 text-sm text-[#a63a2a]">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void uploadImage(f);
        }}
      />
    </div>
  );
}
