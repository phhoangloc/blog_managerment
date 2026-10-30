import type { CSSProperties } from "react";
import BlogList from "@/components/BlogList";
import Counts from "@/components/Counts";
import CoverImage from "@/components/CoverImage";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getBlogs } from "@/lib/api";
import { excerptOf, formatDate, readTime } from "@/lib/format";
import type { Blog } from "@/lib/types";

export const dynamic = "force-dynamic";

function SiteCover() {
  return (
    <section className="relative -mt-[72px] h-svh min-[992px]:fixed min-[992px]:inset-y-0 min-[992px]:left-0 min-[992px]:mt-0 min-[992px]:h-auto min-[992px]:w-[50vw]">
      <div className="absolute inset-0 bg-[var(--sea-900)]" />
      <div className="reveal absolute inset-x-0 bottom-0 p-6 pb-10 min-[992px]:max-w-[75%] min-[992px]:p-14 min-[992px]:pb-16 text-white [text-shadow:0_1px_8px_rgba(0,0,0,.55)]">
        <p className="font-[family-name:var(--font-serif)] text-[19px] max-[1199px]:text-[17px] italic leading-normal text-white/85">
          Chưa có bài viết nào được đăng.
        </p>
      </div>
    </section>
  );
}

// the cover is the first post's own cover image
function Featured({ blog }: { blog: Blog }) {
  return (
    <article className="group relative -mt-[72px] h-svh min-[992px]:fixed min-[992px]:inset-y-0 min-[992px]:left-0 min-[992px]:mt-0 min-[992px]:h-auto min-[992px]:w-[50vw]">
      <div className={`absolute inset-0 overflow-hidden ${blog.coverUrl ? "" : "bg-[var(--sea-900)]"}`}>
        <CoverImage src={blog.coverUrl} alt="" zoom className="absolute inset-0 opacity-75" />
      </div>
      <div className="reveal absolute inset-x-0 bottom-0 p-6 pb-10 min-[992px]:max-w-[75%] min-[992px]:p-14 min-[992px]:pb-16 text-white [text-shadow:0_1px_8px_rgba(0,0,0,.55)]">
        <div className="flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)] text-xs tracking-wide text-white/75">
          <span>{formatDate(blog.createdAt)}</span>
          <span>#{blog.category}</span>
          <span>{readTime(blog.detail)}</span>
        </div>
        <h2 className="mt-3 text-[clamp(24px,2.6vw,38px)] font-normal leading-[1.35] [word-break:auto-phrase] [text-wrap:balance] font-[family-name:var(--font-heading)]">
          <Link href={`/blog/${blog.slug}`} className="text-white underline decoration-transparent underline-offset-8 transition-colors duration-500 after:absolute after:inset-0 hover:text-white group-hover:decoration-white/60">
            {blog.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 font-[family-name:var(--font-serif)] text-[19px] max-[1199px]:text-[17px] leading-normal text-white/85">{excerptOf(blog.detail)}</p>
        <div className="mt-4 [&>div]:!text-white/75">
          <Counts likes={blog.likeCount} comments={blog.commentCount} />
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  let blogs: Blog[] = [];
  let failed = false;
  try {
    blogs = await getBlogs();
  } catch {
    failed = true;
  }

  const [first, ...rest] = blogs;

  return (
    <>
      {first ? <Featured blog={first} /> : <SiteCover />}
      <div className="flex min-h-[calc(100svh-72px)] flex-col">
        <main className="flex flex-1 flex-col px-6 pb-24 pt-10 min-[992px]:ml-[50vw] min-[992px]:px-14">
          <section className="flex min-h-[calc(100svh-72px-2.5rem)] items-center justify-center">
            <figure style={{ "--i": 1 } as CSSProperties} className="reveal mx-auto max-w-[var(--content-width)] text-center">
              <blockquote className="font-[family-name:var(--font-serif)] italic text-[19px] max-[1199px]:text-[17px] leading-relaxed text-[var(--text-muted)]">
                góc nhìn đơn giản cuộc sống ở Nhật - từ bài viết chia sẻ, những món ăn và nét văn hóa mình thấy thú vị.
              </blockquote>
            </figure>
          </section>
          {failed ? (
            <p className="reveal mt-16 font-[family-name:var(--font-serif)] text-lg italic text-[var(--text-subtle)]">
              Hiện không kết nối được tới blog. Vui lòng thử lại sau.
            </p>
          ) : blogs.length === 0 ? null : (
            <BlogList blogs={rest} total={blogs.length} />
          )}
        </main>
        <div className="min-[992px]:ml-[50vw]">
          <Footer />
        </div>
      </div>
    </>
  );
}