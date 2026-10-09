import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About — locpham" };

export default function AboutPage() {
  return (
    <>
      <div className="fixed bottom-0 left-0 top-0 hidden w-1/2 bg-[var(--bg-sunken)] md:block" aria-hidden />
      <main className="px-6 pb-24 pt-16 md:ml-[50vw] md:px-14">
        <h1 className="mb-6 font-[family-name:var(--font-serif)] text-5xl font-medium leading-[1.08] tracking-[var(--tracking-display)]">About</h1>
        <div className="prose-blog max-w-[var(--content-width)]">
          <p>I&apos;m Loc. This is where I write things down for the people I&apos;d otherwise tell in person.</p>
          <p>
            There&apos;s no feed and no comments.
            {site.email && (
              <>
                {" "}If something here makes you think of me, <a href={`mailto:${site.email}`}>send a note</a>.
              </>
            )}
          </p>
        </div>
      </main>
      <div className="md:ml-[50vw]">
        <Footer />
      </div>
    </>
  );
}
