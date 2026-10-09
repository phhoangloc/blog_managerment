"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BlogForm from "@/components/BlogForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { api } from "@/lib/api";
import type { Blog } from "@/lib/types";

export default function BlogEditPage() {
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

  async function remove() {
    setBusy(true);
    try {
      await api(`/blogs/${blog?.slug ?? slug}`, { method: "DELETE" });
      router.replace("/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setConfirming(false);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href={`/blog/${slug}/view`} className="btn btn-ghost self-start">← View</Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="m-0 text-[44px]">Edit blog</h1>
          <button className="btn btn-secondary" onClick={() => setConfirming(true)} disabled={!blog}>Delete blog</button>
        </div>
      </div>
      {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}
      {blog && (
        <div className="card max-w-[820px]">
          <BlogForm
            key={blog.updatedAt}
            initial={blog}
            onSaved={(b) => {
              setBlog(b);
              if (b.slug !== slug) router.replace(`/blog/${b.slug}/edit`); // the slug itself was edited
            }}
          />
        </div>
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
