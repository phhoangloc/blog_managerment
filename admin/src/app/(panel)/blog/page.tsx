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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    setIsUser(getRole() === "user");
    setIsAdmin(getRole() === "admin");
  }, []);

  useEffect(() => {
    api<Blog[]>("/blogs")
      .then(setBlogs)
      .catch((e: Error) => setError(e.message));
  }, []);

  // users reach their drafts through My blogs; admins switch between published and draft here
  const shown = blogs?.filter((b) => b.draft === (isAdmin && showDrafts));

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 text-[44px]">Blog</h1>
        {/* users reach their own blogs (drafts included) here */}
        {isUser && <Link href="/blog/myblog" className="btn btn-secondary">My blogs</Link>}
      </header>
      {isAdmin && (
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowDrafts(false)} className={`btn !px-5 !py-1.5 ${!showDrafts ? "btn-primary" : "btn-ghost"}`}>Published</button>
          <button type="button" onClick={() => setShowDrafts(true)} className={`btn !px-5 !py-1.5 ${showDrafts ? "btn-primary" : "btn-ghost"}`}>Drafts</button>
        </div>
      )}
      {error && <p className="m-0 text-sm text-[#a63a2a]">{error}</p>}

      {/* cards stacked vertically, same width limit as the view page, aligned left with the heading; a rule and extra space tell one post from the next */}
      <div className="flex flex-col items-start">
        {shown?.map((b) => (
          <div key={b.id} className="w-full max-w-[820px] border-t border-neutral-300 py-12 first:border-t-0 first:pt-0">
            <BlogCard blog={b} />
          </div>
        ))}
      </div>
      {shown && shown.length === 0 && (
        <p className="m-0 p-6 text-neutral-700">{isAdmin && showDrafts ? "No drafts." : isUser ? "No published blogs yet. Use New blog to write one." : "No published blogs yet."}</p>
      )}
    </>
  );
}
