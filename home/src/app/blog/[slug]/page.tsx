import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyLinkButton from "@/components/CopyLinkButton";
import CoverImage from "@/components/CoverImage";
import Footer from "@/components/Footer";
import Prose from "@/components/Prose";
import { getBlog, getBlogs } from "@/lib/api";
import { excerptOf, formatDate, readTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug).catch(() => null);
  return blog ? { title: `${blog.title} — locpham`, description: excerptOf(blog.detail, 160) } : { title: "Not found — locpham" };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  // list is newest first, so the "next" post is the older one
  const all = await getBlogs().catch(() => []);
  const next = all[all.findIndex((b) => b.slug === blog.slug) + 1];

  return (
    <>
      <CoverImage muted fadeRight src={blog.coverUrl} alt={blog.title} className="fixed bottom-0 left-0 top-0 hidden w-1/2 md:block" />
      <main className="px-6 pb-24 pt-6 md:ml-[50vw] md:px-14">
        <div className="max-w-[var(--content-width)]">
          <Link href="/" className="text-[13px] text-[var(--text-subtle)] no-underline hover:text-[var(--text-body)]">
            ← All posts
          </Link>
          <div className="mb-3.5 mt-10 flex flex-wrap items-center gap-3.5 font-[family-name:var(--font-mono)] text-xs text-[var(--text-subtle)]">
            <span>{formatDate(blog.createdAt)}</span>
            <span>{readTime(blog.detail)}</span>
            <span>#{blog.category}</span>
            <span>by {blog.authorName}</span>
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-[clamp(34px,4vw,48px)] font-medium leading-[1.08] tracking-[var(--tracking-display)] [text-wrap:balance]">
            {blog.title}
          </h1>
          {/* below md the fixed left image is hidden, so show the cover between title and content */}
          {blog.coverUrl && <CoverImage muted src={blog.coverUrl} alt={blog.title} className="relative mt-8 aspect-[16/10] rounded-md md:hidden" />}
          <div className="mt-10">
            <Prose html={blog.detail} />
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-default)] pt-5">
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
      <div className="md:ml-[50vw]">
        <Footer />
      </div>
    </>
  );
}
