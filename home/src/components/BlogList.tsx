"use client";

import { CSSProperties, useState } from "react";
import type { Blog } from "@/lib/types";
import BlogCard from "./BlogCard";

const PAGE = 10;

// `blogs` is everything after the cover post; the home page shows PAGE posts in total (cover included),
// "Xem thêm" reveals PAGE more each time
export default function BlogList({ blogs, total }: { blogs: Blog[]; total: number }) {
  const first = PAGE - 1;
  const [shown, setShown] = useState(first);
  const visible = blogs.slice(0, shown);
  const more = blogs.length > shown;

  return (
    <>
      <div className="mt-6 flex flex-col gap-[72px]">
        {visible.map((b, i) => (
          <div key={b.id} className="reveal" style={{ "--i": i < first ? Math.min(i + 2, 8) : 0 } as CSSProperties}>
            <BlogCard blog={b} />
          </div>
        ))}
      </div>
      {more && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mx-auto mt-12 inline-flex h-10 items-center rounded-md border border-[var(--border-default)] px-6 text-sm text-[var(--text-body)] hover:bg-[var(--bg-sunken)]"
        >
          Xem thêm
        </button>
      )}
      <div className="reveal mt-12 font-[family-name:var(--font-mono)] text-xs text-[var(--text-subtle)]">
        {Math.min(shown + 1, total)} / {total} bài viết
      </div>
    </>
  );
}
