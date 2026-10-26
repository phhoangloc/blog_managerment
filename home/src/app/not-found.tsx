import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[var(--content-width)] px-6 pt-16">
      <h1 className="font-[family-name:var(--font-heading)] text-4xl max-[1199px]:text-[32px] font-normal">見つかりません</h1>
      <p className="mt-4 font-[family-name:var(--font-serif)] text-lg italic text-[var(--text-subtle)]">そんなものはまだありません。</p>
      <Link href="/" className="mt-6 inline-block">← 記事一覧</Link>
    </main>
  );
}
