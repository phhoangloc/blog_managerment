"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import BlogForm from "@/components/BlogForm";

export default function NewBlogPage() {
  const router = useRouter();
  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/blog" className="btn btn-ghost self-start">← Blog</Link>
        <h1 className="m-0 text-[44px]">New blog</h1>
      </div>
      <div className="card max-w-[820px]">
        <BlogForm onSaved={(b) => router.replace(`/blog/${b.slug}/view`)} />
      </div>
    </>
  );
}
