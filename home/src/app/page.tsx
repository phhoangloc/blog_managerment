import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import { getBlogs } from "@/lib/api";
import type { Blog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let blogs: Blog[] = [];
  let failed = false;
  try {
    blogs = await getBlogs();
  } catch {
    failed = true;
  }

  return (
    <>
      <main className="mx-auto max-w-[760px] px-6 pt-4">
        {failed ? (
          <p className="mt-16 font-[family-name:var(--font-serif)] text-lg italic text-[var(--text-subtle)]">
            Can&apos;t reach the blog right now. Please try again in a moment.
          </p>
        ) : blogs.length === 0 ? (
          <p className="mt-16 font-[family-name:var(--font-serif)] text-lg italic text-[var(--text-subtle)]">Nothing published yet.</p>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-[72px]">
              {blogs.map((b) => (
                <BlogCard key={b.id} blog={b} />
              ))}
            </div>
            <div className="mt-12 font-[family-name:var(--font-mono)] text-xs text-[var(--text-subtle)]">{blogs.length} posts</div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
