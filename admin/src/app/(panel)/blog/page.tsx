"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";
import { api } from "@/lib/api";
import { getRole } from "@/lib/auth";
import type { Blog } from "@/lib/types";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [error, setError] = useState("");
  const [isUser, setIsUser] = useState(false);

  useEffect(() => setIsUser(getRole() === "user"), []);

  useEffect(() => {
    api<Blog[]>("/blogs")
      .then((all) => setBlogs(all.filter((b) => !b.draft))) // only published blogs are listed
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 text-[44px]">Blog</h1>
        {/* users reach their own blogs (drafts included) here */}
        {isUser && <Link href="/blog/myblog" className="btn btn-secondary">My blogs</Link>}
      </header>
      {error && <p className="m-0 text-sm text-[#a63a2a]">{error}</p>}

      {/* cards stacked vertically, same width limit as the view page, aligned left with the heading; a rule and extra space tell one post from the next */}
      <div className="flex flex-col items-start">
        {blogs?.map((b) => (
          <div key={b.id} className="w-full max-w-[820px] border-t border-neutral-300 py-12 first:border-t-0 first:pt-0">
            <BlogCard blog={b} />
          </div>
        ))}
      </div>
      {blogs && blogs.length === 0 && (
        <p className="m-0 p-6 text-neutral-700">{isUser ? "No published blogs yet. Use New blog to write one." : "No published blogs yet."}</p>
      )}
    </>
  );
}
