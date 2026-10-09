"use client";

import DOMPurify from "dompurify";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import BlogCounts from "@/components/BlogCounts";
import ConfirmDialog from "@/components/ConfirmDialog";
import { api, API_URL } from "@/lib/api";
import { getRole } from "@/lib/auth";
import { formatDate } from "@/lib/files";
import type { Blog, BlogComment } from "@/lib/types";

export default function BlogViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);

  useEffect(() => {
    api<Blog>(`/blogs/${slug}`)
      .then(setBlog)
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  // admins moderate, so they get every comment of this blog (hidden ones too); users see the visible ones
  useEffect(() => {
    const path = getRole() === "admin" ? "/comments" : `/public/blogs/${slug}/comments`;
    api<BlogComment[]>(path)
      .then((all) => setComments(all.filter((c) => c.blogSlug === slug)))
      .catch(() => setComments([])); // a draft has no public comments
  }, [slug]);

  // the stored HTML is sanitized again before it is rendered
  const html = useMemo(() => (blog ? DOMPurify.sanitize(blog.detail) : ""), [blog]);

  async function remove() {
    setBusy(true);
    try {
      await api(`/blogs/${slug}`, { method: "DELETE" });
      router.replace("/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setConfirming(false);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/blog" className="btn btn-ghost">← Blog</Link>
        {blog && (
          <div className="flex gap-2">
            <Link href={`/blog/${blog.slug}/edit`} className="btn btn-primary">Edit</Link>
            <button className="btn btn-secondary" onClick={() => setConfirming(true)}>Delete</button>
          </div>
        )}
      </div>
      {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}

      {blog && (
        <article className="flex max-w-[820px] flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag tag-neutral">{blog.category}</span>
            <span className={`tag ${blog.draft ? "tag-accent" : "tag-sage"}`}>{blog.draft ? "Draft" : "Published"}</span>
          </div>
          <h1 className="m-0 text-[44px]">{blog.title}</h1>
          <span className="text-sm text-neutral-700">By {blog.authorName} · {formatDate(blog.createdAt)}</span>
          {blog.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${API_URL}${blog.coverUrl}`} alt={blog.title} className="washed max-h-[420px] w-full object-cover" />
          ) : (
            // same placeholder as the blog card
            <div className="grid aspect-[16/7] w-full place-items-center bg-neutral-100 text-sm text-neutral-700">No cover</div>
          )}
          <BlogCounts likes={blog.likeCount} comments={blog.commentCount} />
          <div className="rich text-[17px] leading-[1.75]" dangerouslySetInnerHTML={{ __html: html }} />

          <section className="mt-4 flex flex-col gap-3 border-t border-neutral-300 pt-6" aria-label="Comments">
            <h2 className="m-0 text-[26px]">Comments ({comments.length})</h2>
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-[20px] bg-neutral-100 p-4">
                <Avatar name={c.userName} url={c.avatarUrl} size={36} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-xs text-neutral-700">{c.userName} · {formatDate(c.createdAt)}</span>
                  <span className="whitespace-pre-line break-words">{c.content}</span>
                </div>
                {c.hidden && <span className="tag tag-neutral">Hidden</span>}
                {getRole() === "admin" && <Link href={`/comment/${c.id}/edit`} className="btn btn-ghost">Manage</Link>}
              </div>
            ))}
            {comments.length === 0 && <p className="m-0 text-neutral-700">No comments yet.</p>}
          </section>
        </article>
      )}

      {confirming && blog && (
        <ConfirmDialog
          title="Delete blog?"
          message={`"${blog.title}" will be permanently deleted.`}
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
