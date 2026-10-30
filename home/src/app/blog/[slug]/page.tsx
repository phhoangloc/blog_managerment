import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogEngagement from "@/components/BlogEngagement";
import CopyLinkButton from "@/components/CopyLinkButton";
import CoverImage from "@/components/CoverImage";
import Footer from "@/components/Footer";
import Prose from "@/components/Prose";
import { getBlog, getBlogs, getComments } from "@/lib/api";
import { excerptOf, formatDate, readTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug).catch(() => null);
  return blog ? { title: `${blog.title} — locpham`, description: excerptOf(blog.detail, 160) } : { title: "Không tìm thấy — locpham" };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  // list is newest first, so the "next" post is the older one
  const [all, comments] = await Promise.all([getBlogs().catch(() => []), getComments(blog.slug)]);
  const next = all[all.findIndex((b) => b.slug === blog.slug) + 1];

  return (
    <>
      <CoverImage muted fadeRight src={blog.coverUrl} alt={blog.title} className="fixed bottom-0 left-0 top-0 hidden w-[50vw] min-[992px]:block" />
      <div className="flex min-h-[calc(100svh-72px)] flex-col">
        <main className="flex-1 px-6 pb-24 pt-10 min-[992px]:ml-[50vw] min-[992px]:px-14">
          <div className="reveal min-[992px]:max-w-[var(--content-width)]">
            <Link href="/" className="text-[13px] text-[var(--text-subtle)] no-underline hover:text-[var(--text-body)]">
              ← Danh sách bài viết
            </Link>
            <div className="mb-3.5 mt-10 flex flex-wrap items-center gap-3.5 font-[family-name:var(--font-mono)] text-xs text-[var(--text-subtle)]">
              <span>{formatDate(blog.createdAt)}</span>
              <span>{readTime(blog.detail)}</span>
              <span>#{blog.category}</span>
              <span>{blog.authorName}</span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-[clamp(24px,2.8vw,36px)] font-normal leading-[1.4] [word-break:auto-phrase] [text-wrap:balance]">
              {blog.title}
            </h1>
            {/* below 992px the fixed left image is hidden, so show the cover between title and content */}
            <CoverImage muted src={blog.coverUrl} alt={blog.title} className="relative mt-8 aspect-[16/10] rounded-md min-[992px]:hidden" />
            <div className="mt-10">
              <Prose html={blog.detail} />
            </div>
            <BlogEngagement slug={blog.slug} initialLikes={blog.likeCount} initialComments={comments} />
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-default)] pt-5">
              <CopyLinkButton />
              {next && (
                <Link
                  href={`/blog/${next.slug}`}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-default)] px-4 text-sm text-[var(--text-body)] no-underline hover:bg-[var(--bg-sunken)] hover:text-[var(--text-body)]"
                >
                  {next.title} →
                </Link>
              )}
            </div>
          </div>
        </main>
        <div className="min-[992px]:ml-[50vw]">
          <Footer />
        </div>
      </div>
    </>
  );
}
