"use client";

import { FormEvent, useState } from "react";
import { api, API_URL } from "@/lib/api";
import { uploadFile } from "@/lib/upload";
import type { Blog } from "@/lib/types";
import ImageUpload from "./ImageUpload";
import RichTextBox from "./RichTextBox";

interface Props {
  /** Present when editing */
  initial?: Blog;
  onSaved: (blog: Blog) => void;
}

// Create / edit form: cover (image drop box), detail (rich text box)
export default function BlogForm({ initial, onSaved }: Props) {
  const editing = !!initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [draft, setDraft] = useState(initial?.draft ?? true);
  const [detail, setDetail] = useState(initial?.detail ?? "");
  const [cover, setCover] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setBusy(true);
    try {
      const body: Record<string, unknown> = { title, category, draft, detail };
      if (slug) body.slug = slug; // empty on create = generated from the title
      if (cover) body.coverId = (await uploadFile(cover, "Cover")).id;
      else if (removeCover) body.coverId = null;

      const blog = editing
        ? await api<Blog>(`/blogs/${initial!.slug}`, { method: "PUT", body: JSON.stringify(body) })
        : await api<Blog>("/blogs", { method: "POST", body: JSON.stringify(body) });
      setCover(null);
      setRemoveCover(false);
      setSaved(true);
      onSaved(blog);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const hasCover = !!initial?.coverUrl && !removeCover;

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="field">
        <label htmlFor="blog-title">Title</label>
        <input id="blog-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="blog-slug">Slug {editing ? "" : "(optional, generated from the title)"}</label>
          <input id="blog-slug" className="input" value={slug} onChange={(e) => setSlug(e.target.value)} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder={editing ? "" : "my-first-post"} required={editing} />
        </div>
        <div className="field">
          <label htmlFor="blog-category">Category</label>
          <input id="blog-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)} required maxLength={100} />
        </div>
      </div>

      <div className="field">
        <label>Status</label>
        <div className="flex w-fit gap-1 rounded-full bg-neutral-200 p-1" role="radiogroup" aria-label="Status">
          {[
            { label: "Draft", value: true },
            { label: "Published", value: false },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={draft === o.value}
              onClick={() => setDraft(o.value)}
              className={`btn !px-5 !py-1.5 ${draft === o.value ? "btn-primary" : "btn-ghost"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Cover</label>
        <ImageUpload
          accept="image/*"
          file={cover}
          onChange={(f) => {
            setCover(f);
            if (f) setRemoveCover(false);
          }}
          current={hasCover ? { url: `${API_URL}${initial!.coverUrl}`, filename: "cover.png" } : undefined}
        />
        {(hasCover || cover) && (
          <button
            type="button"
            className="btn btn-ghost mt-1"
            onClick={() => {
              setCover(null);
              setRemoveCover(true);
            }}
          >
            Remove cover
          </button>
        )}
      </div>

      <div className="field">
        <label>Detail</label>
        <RichTextBox
          value={detail}
          onChange={setDetail}
          onUploadImage={async (img) => `${API_URL}${(await uploadFile(img, "Inline")).url}`}
        />
      </div>

      {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}
      <div className="flex items-center gap-2">
        <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create blog"}</button>
        {saved && <span className="tag tag-sage">Saved</span>}
      </div>
    </form>
  );
}
