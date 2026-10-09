"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";
import { api } from "@/lib/api";
import type { Blog } from "@/lib/types";

// The logged-in user's own blogs, drafts included (the API only returns a user's own blogs)
export default function MyBlogPage() {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Blog[]>("/blogs")
      .then(setBlogs)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/blog" className="btn btn-ghost self-start">← Blog</Link>
        <h1 className="m-0 text-[44px]">My blogs</h1>
      </div>
      {error && <p className="m-0 text-sm text-[#a63a2a]">{error}</p>}

      <div className="flex flex-col items-start gap-6">
        {blogs?.map((b) => <BlogCard key={b.id} blog={b} />)}
      </div>
      {blogs && blogs.length === 0 && (
        <p className="m-0 p-6 text-neutral-700">You have not written any blog yet. Use New blog to write one.</p>
      )}
    </>
  );
}
