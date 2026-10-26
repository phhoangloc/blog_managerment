import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "紹介 — locpham",
  description: "日本にあるベトナム料理のお店と、お店を探しているお客さまをつなぐブログです。",
};

const steps = [
  { title: "お店を知る", body: "店主やスタッフの想い、おすすめの一皿、お店のある街の空気まで、記事で丁寧に紹介します。" },
  { title: "気になったら行ってみる", body: "記事を読んで気になったお店へ、足を運んでみてください。初めての方にも分かりやすいように書いています。" },
  { title: "声を届ける", body: "ログインすると、記事にいいねやコメントができます。感想はお店にとって何よりの励みになります。" },
];

export default function AboutPage() {
  return (
    <>
      <div className="fixed bottom-0 left-0 top-0 hidden w-1/2 bg-[var(--bg-sunken)] min-[992px]:block" aria-hidden />
      <main className="px-6 pb-24 pt-16 min-[992px]:ml-[50vw] min-[992px]:px-14">
        <h1 className="mb-6 font-[family-name:var(--font-heading)] text-4xl max-[1199px]:text-[32px] font-normal leading-[1.3]">紹介</h1>
        <div className="prose-blog min-[992px]:max-w-[var(--content-width)]">
          <p>
            このサイトは、日本各地にあるベトナム料理のお店と、おいしいベトナムの味を探しているお客さまをつなぐためのブログです。
          </p>
          <p>
            フォーや生春巻き、バインミー。日本でも身近になったベトナム料理ですが、本場の味を守りながら営業している小さなお店は、まだ知られていないことも少なくありません。
            そんなお店の魅力を、一軒ずつ記事にしてお届けします。
          </p>

          <h2>このサイトでできること</h2>
          <ol>
            {steps.map((s) => (
              <li key={s.title}>
                <strong>{s.title}</strong>
                <br />
                {s.body}
              </li>
            ))}
          </ol>

          <h2>お店の方へ</h2>
          <p>
            ベトナム料理のお店を営んでいる方は、ぜひお気軽にご連絡ください。お店の紹介記事の掲載について、ご相談を承ります。
            {site.email && (
              <>
                {" "}ご連絡は <a href={`mailto:${site.email}`}>{site.email}</a> まで。
              </>
            )}
          </p>

          <p>
            <Link href="/">記事を読む →</Link>
          </p>
        </div>
      </main>
      <div className="min-[992px]:ml-[50vw]">
        <Footer />
      </div>
    </>
  );
}
