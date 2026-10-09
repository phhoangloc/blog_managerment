import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[var(--content-width)] px-6 pt-16">
      <h1 className="font-[family-name:var(--font-serif)] text-5xl font-medium">Not found</h1>
      <p className="mt-4 font-[family-name:var(--font-serif)] text-lg italic text-[var(--text-subtle)]">Nothing by that name. Yet.</p>
      <Link href="/" className="mt-6 inline-block">← All posts</Link>
    </main>
  );
}
