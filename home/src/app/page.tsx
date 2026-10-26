import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import Counts from "@/components/Counts";
import CoverImage from "@/components/CoverImage";
import Footer from "@/components/Footer";
import { getBlogs } from "@/lib/api";
import { excerptOf, formatDate, readTime } from "@/lib/format";
import type { Blog } from "@/lib/types";

export const dynamic = "force-dynamic";

// the left half keeps the same edge fade as the cover (side by side only); the gradient shares the mask so the title never sits on the faded part
const FADE = "min-[992px]:[mask-image:linear-gradient(to_right,#000_62%,transparent_100%)] min-[992px]:[-webkit-mask-image:linear-gradient(to_right,#000_62%,transparent_100%)]";

function Featured({ blog }: { blog: Blog }) {
  return (
    <article className="group relative -mt-[72px] h-svh min-[992px]:fixed min-[992px]:inset-y-0 min-[992px]:left-0 min-[992px]:mt-0 min-[992px]:h-auto min-[992px]:w-1/2">
      <div className={`absolute inset-0 ${FADE} ${blog.coverUrl ? "" : "bg-[var(--sea-900)]"}`}>
        <CoverImage src={blog.coverUrl} alt="" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 pb-10 min-[992px]:max-w-[75%] min-[992px]:p-14 min-[992px]:pb-16 text-white">
        <div className="flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)] text-xs tracking-wide text-white/75">
          <span>{formatDate(blog.createdAt)}</span>
          <span>#{blog.category}</span>
          <span>{readTime(blog.detail)}</span>
        </div>
        <h2 className="mt-3 text-[clamp(24px,2.6vw,38px)] font-normal leading-[1.35] [word-break:auto-phrase] [text-wrap:balance] font-[family-name:var(--font-heading)]">
          <Link href={`/blog/${blog.slug}`} className="text-white no-underline after:absolute after:inset-0 hover:text-white group-hover:underline group-hover:decoration-white/60 group-hover:underline-offset-8">
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
      {first && <Featured blog={first} />}
      <main className="px-6 pt-4 min-[992px]:ml-[50vw] min-[992px]:px-14">
        {failed ? (
          <p className="mt-16 font-[family-name:var(--font-serif)] text-lg italic text-[var(--text-subtle)]">
            現在ブログに接続できません。しばらくしてからもう一度お試しください。
          </p>
        ) : blogs.length === 0 ? (
          <p className="mt-16 font-[family-name:var(--font-serif)] text-lg italic text-[var(--text-subtle)]">まだ公開された記事はありません。</p>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-[72px]">
              {rest.map((b) => (
                <BlogCard key={b.id} blog={b} />
              ))}
            </div>
            <div className="mt-12 font-[family-name:var(--font-mono)] text-xs text-[var(--text-subtle)]">{blogs.length} 件の記事</div>
          </>
        )}
      </main>
      <div className="min-[992px]:ml-[50vw]">
        <Footer />
      </div>
    </>
  );
}
