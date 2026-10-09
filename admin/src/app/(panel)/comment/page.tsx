"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/files";
import type { BlogComment } from "@/lib/types";

// Admin moderation list: every comment, newest first, hidden ones marked
export default function CommentListPage() {
  const [comments, setComments] = useState<BlogComment[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<BlogComment[]>("/comments")
      .then((c) => setComments([...c].reverse()))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 text-[44px]">Comment</h1>
        {comments && <span className="text-sm text-neutral-700">{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>}
      </header>
      {error && <p className="m-0 text-sm text-[#a63a2a]">{error}</p>}

      <div className="flex flex-col gap-2">
        {comments?.map((c) => (
          <Link
            key={c.id}
            href={`/comment/${c.id}/edit`}
            className="flex items-start gap-4 rounded-[20px] bg-neutral-100 p-4 hover:bg-neutral-200"
          >
            <Avatar name={c.userName} url={c.avatarUrl} size={44} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="line-clamp-2 whitespace-pre-line break-words font-semibold">{c.content}</span>
              <span className="truncate text-xs text-neutral-700">
                {c.userName} on “{c.blogTitle}” · {formatDate(c.createdAt)}
              </span>
            </div>
            {c.hidden ? <span className="tag tag-neutral">Hidden</span> : <span className="tag tag-sage">Visible</span>}
          </Link>
        ))}
        {comments && comments.length === 0 && <p className="m-0 p-6 text-neutral-700">No comments yet.</p>}
      </div>
    </>
  );
}
