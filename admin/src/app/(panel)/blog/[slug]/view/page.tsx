"use client";

import DOMPurify from "dompurify";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { api, API_URL } from "@/lib/api";
import { formatDate } from "@/lib/files";
import type { Blog } from "@/lib/types";

export default function BlogViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Blog>(`/blogs/${slug}`)
      .then(setBlog)
      .catch((e: Error) => setError(e.message));
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
          <div className="rich text-[17px] leading-[1.75]" dangerouslySetInnerHTML={{ __html: html }} />
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
