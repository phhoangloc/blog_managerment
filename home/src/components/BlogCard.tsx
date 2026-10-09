import Link from "next/link";
import { excerptOf, formatDate, readTime } from "@/lib/format";
import type { Blog } from "@/lib/types";
import Counts from "./Counts";
import CoverImage from "./CoverImage";

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <article className="group relative flex cursor-pointer flex-col gap-5">
      <Link href={`/blog/${blog.slug}`} className="block rounded-md" aria-hidden tabIndex={-1}>
        <CoverImage src={blog.coverUrl} alt="" className="relative aspect-[16/8] rounded-md" />
      </Link>
      <div>
        <div className="flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--text-subtle)]">
          <span>{formatDate(blog.createdAt)}</span>
          <span>#{blog.category}</span>
          <span className="text-[var(--text-faint)]">{readTime(blog.detail)}</span>
        </div>
        <h2 className="mt-3 text-[clamp(30px,4.5vw,48px)] font-medium leading-[1.15] tracking-[var(--tracking-display)] [text-wrap:balance] font-[family-name:var(--font-serif)]">
          <Link href={`/blog/${blog.slug}`} className="text-[var(--text-body)] no-underline after:absolute after:inset-0 group-hover:text-[var(--accent)]">
            {blog.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 font-[family-name:var(--font-serif)] text-[19px] leading-normal text-[var(--text-muted)]">
          {excerptOf(blog.detail)}
        </p>
        <div className="mt-3">
          <Counts likes={blog.likeCount} comments={blog.commentCount} />
        </div>
      </div>
    </article>
  );
}
