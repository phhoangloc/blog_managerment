"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { authedFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { RealtimeEvent, useBlogEvents } from "@/lib/realtime";
import type { BlogComment } from "@/lib/types";
import Avatar from "./Avatar";
import { CommentIcon, HeartIcon } from "./Counts";

interface Props {
  slug: string;
  initialLikes: number;
  initialComments: BlogComment[];
}

const byId = (a: BlogComment, b: BlogComment) => a.id - b.id;

// Like button, comment count + list and the comment box; all counts update live over the websocket
export default function BlogEngagement({ slug, initialLikes, initialComments }: Props) {
  const router = useRouter();
  const { token, userId, ready } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<{ id: number; text: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loginUrl = `/login?next=${encodeURIComponent(`/blog/${slug}`)}`;

  // whether the logged-in reader already liked this post
  useEffect(() => {
    if (!token) {
      setLiked(false);
      return;
    }
    authedFetch<{ like: boolean }>(`/blogs/${slug}/like`, token)
      .then((r) => setLiked(r.like))
      .catch(() => setLiked(false));
  }, [slug, token]);

  useBlogEvents(
    slug,
    useCallback((e: RealtimeEvent) => {
      if (e.type === "like:changed") setLikes(e.likeCount);
      else if (e.type === "comment:deleted") setComments((c) => c.filter((x) => x.id !== e.id));
      else setComments((c) => [...c.filter((x) => x.id !== e.comment.id), e.comment].sort(byId));
    }, []),
  );

  async function toggleLike() {
    if (!token) return router.push(loginUrl);
    setError("");
    const next = !liked;
    setLiked(next); // optimistic
    try {
      const r = await authedFetch<{ like: boolean; likeCount: number }>(`/blogs/${slug}/like`, token, {
        method: "PUT",
        body: JSON.stringify({ like: next }),
      });
      setLiked(r.like);
      setLikes(r.likeCount);
    } catch (err) {
      setLiked(!next);
      setError(err instanceof Error ? err.message : "Could not update like");
    }
  }

  function focusComment() {
    if (!token) return router.push(loginUrl);
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputRef.current?.focus();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!token) return router.push(loginUrl);
    setError("");
    setBusy(true);
    try {
      const c = await authedFetch<BlogComment>(`/blogs/${slug}/comments`, token, {
        method: "POST",
        body: JSON.stringify({ content: draft }),
      });
      setComments((list) => [...list.filter((x) => x.id !== c.id), c].sort(byId));
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!token || !editing) return;
    setError("");
    try {
      const c = await authedFetch<BlogComment>(`/comments/${editing.id}`, token, {
        method: "PUT",
        body: JSON.stringify({ content: editing.text }),
      });
      setComments((list) => list.map((x) => (x.id === c.id ? c : x)));
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save comment");
    }
  }

  async function remove(id: number) {
    if (!token) return;
    setError("");
    try {
      await authedFetch(`/comments/${id}`, token, { method: "DELETE" });
      setComments((list) => list.filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete comment");
    }
  }

  const pill =
    "inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-default)] px-3.5 text-sm hover:bg-[var(--bg-sunken)]";
  const small = "text-xs text-[var(--text-subtle)] hover:text-[var(--text-body)]";

  return (
    <section aria-label="Likes and comments" className="mt-12 border-t border-[var(--border-default)] pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          className={`${pill} ${liked ? "border-[var(--accent)] text-[var(--accent)]" : "text-[var(--text-body)]"}`}
        >
          <HeartIcon filled={liked} /> {liked ? "Liked" : "Like"} · {likes}
        </button>
        <button type="button" onClick={focusComment} className={`${pill} text-[var(--text-body)]`}>
          <CommentIcon /> Comment · {comments.length}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[var(--accent)]">
          {error}
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-6 p-0">
        {comments.map((c) => (
          <li key={c.id} className="flex list-none gap-3">
            <Avatar name={c.userName} url={c.avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 font-[family-name:var(--font-mono)] text-xs text-[var(--text-subtle)]">
                <span className="text-[var(--text-body)]">{c.userName}</span>
                <span>{formatDate(c.createdAt)}</span>
              </div>
              {editing?.id === c.id ? (
                <div className="mt-2 flex flex-col gap-2">
                  <textarea
                    value={editing.text}
                    onChange={(e) => setEditing({ id: c.id, text: e.target.value })}
                    maxLength={2000}
                    rows={3}
                    className="w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-raised)] p-3 text-[15px] text-[var(--text-body)] outline-none focus:border-[var(--sea-500)]"
                  />
                  <div className="flex gap-3">
                    <button type="button" onClick={saveEdit} className={small}>Save</button>
                    <button type="button" onClick={() => setEditing(null)} className={small}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="m-0 mt-1 whitespace-pre-wrap break-words font-[family-name:var(--font-serif)] text-[17px] leading-relaxed text-[var(--text-reading)]">
                    {c.content}
                  </p>
                  {userId === c.userId && (
                    <div className="mt-1 flex gap-3">
                      <button type="button" onClick={() => setEditing({ id: c.id, text: c.content })} className={small}>Edit</button>
                      <button type="button" onClick={() => remove(c.id)} className={small}>Delete</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="list-none font-[family-name:var(--font-serif)] italic text-[var(--text-subtle)]">No comments yet.</li>
        )}
      </ul>

      {ready && !token ? (
        <p className="mt-8 font-[family-name:var(--font-serif)] text-[17px] text-[var(--text-muted)]">
          <Link href={loginUrl}>Log in</Link> to like and comment.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment…"
            maxLength={2000}
            rows={3}
            required
            className="w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-raised)] p-3 font-[family-name:var(--font-serif)] text-[17px] text-[var(--text-body)] outline-none focus:border-[var(--sea-500)]"
          />
          <button
            disabled={busy || !draft.trim()}
            className="h-10 self-start rounded-md bg-[var(--accent)] px-5 text-sm font-medium text-[var(--on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {busy ? "Posting…" : "Post comment"}
          </button>
        </form>
      )}
    </section>
  );
}
