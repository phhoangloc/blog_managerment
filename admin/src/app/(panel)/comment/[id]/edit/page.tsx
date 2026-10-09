"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/files";
import type { BlogComment } from "@/lib/types";

export default function CommentEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [comment, setComment] = useState<BlogComment | null>(null);
  const [content, setContent] = useState("");
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<BlogComment>(`/comments/${id}`)
      .then((c) => {
        setComment(c);
        setContent(c.content);
        setHidden(c.hidden);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setBusy(true);
    try {
      const updated = await api<BlogComment>(`/comments/${id}`, { method: "PUT", body: JSON.stringify({ content, hidden }) });
      setComment(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api(`/comments/${id}`, { method: "DELETE" });
      router.replace("/comment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setConfirming(false);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/comment" className="btn btn-ghost self-start">← Comment</Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="m-0 text-[44px]">Edit comment #{id}</h1>
          <div className="flex items-center gap-2">
            {saved && <span className="tag tag-sage">Saved</span>}
            <button className="btn btn-secondary" onClick={() => setConfirming(true)} disabled={!comment}>Delete comment</button>
          </div>
        </div>
      </div>

      {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}

      {comment && (
        <form onSubmit={save} className="card flex max-w-[760px] flex-col gap-4">
          <p className="m-0 text-sm text-neutral-700">
            By <strong>{comment.userName}</strong> on{" "}
            <Link href={`/blog/${comment.blogSlug}/view`}>{comment.blogTitle}</Link> · {formatDate(comment.createdAt)}
          </p>
          <div className="field">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              className="input min-h-[140px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              required
            />
          </div>
          <div className="field">
            <label>Visibility</label>
            <div className="flex gap-1 self-start rounded-full bg-neutral-200 p-1" role="radiogroup" aria-label="Visibility">
              {[
                { value: false, label: "Visible" },
                { value: true, label: "Hidden" },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={hidden === o.value}
                  onClick={() => setHidden(o.value)}
                  className={`btn !px-5 !py-1.5 ${hidden === o.value ? "btn-primary" : "btn-ghost"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-neutral-700">Hidden comments are not shown on the public site.</span>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      )}

      {confirming && comment && (
        <ConfirmDialog
          title="Delete comment?"
          message="This comment will be permanently deleted."
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
