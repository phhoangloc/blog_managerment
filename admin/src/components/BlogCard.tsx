import Link from "next/link";
import { API_URL } from "@/lib/api";
import { formatDateDots, stripHtml } from "@/lib/files";
import type { Blog } from "@/lib/types";
import BlogCounts from "./BlogCounts";

// Vertical card: image on top, then tags, title, author/date and excerpt. Same limits and font sizes as the blog view page (max 820px, cover up to 420px tall).
export default function BlogCard({ blog: b }: { blog: Blog }) {
  // plain card: no background, border, shadow or transition
  return (
    <article className="relative flex w-full max-w-[820px] cursor-pointer flex-col overflow-hidden">
      <Link href={`/blog/${b.slug}/view`} className="block aspect-[16/10] max-h-[420px] w-full overflow-hidden bg-neutral-100" aria-label={`Open ${b.title}`}>
        {b.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${API_URL}${b.coverUrl}`} alt="" className="washed h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-sm text-neutral-700">No cover</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-5 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tag tag-neutral">{b.category}</span>
          <span className={`tag ${b.draft ? "tag-accent" : "tag-sage"}`}>{b.draft ? "Draft" : "Published"}</span>
        </div>

        {/* stretched link: the whole card is clickable */}
        <Link href={`/blog/${b.slug}/view`} className="no-underline after:absolute after:inset-0 after:content-['']">
          <h2 className="m-0 line-clamp-2 text-[44px] text-ink">{b.title}</h2>
        </Link>
        {/* author and date sit above the detail */}
        <span className="text-sm text-neutral-700 opacity-50">{b.authorName} · {formatDateDots(b.createdAt)}</span>
        <p className="m-0 line-clamp-3 text-[17px] leading-[1.75] text-neutral-700">{stripHtml(b.detail) || "No content yet"}</p>
        <BlogCounts likes={b.likeCount} comments={b.commentCount} />

      </div>
    </article>
  );
}
