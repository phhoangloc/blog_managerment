import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Giới thiệu — locpham",
  description: "Blog chia sẻ về ẩm thực, những nơi đáng đi, trải nghiệm cuộc sống và lập trình khi sống tại Nhật Bản.",
};

const topics = [
  { title: "Cuộc sống ở Nhật", body: "Ẩm thực, những nơi đáng ghé chơi, các trải nghiệm thú vị và những câu chuyện thường ngày mà mình muốn chia sẻ lại với bạn." },
  { title: "Lập trình", body: "Những gì mình học được về lập trình: kỹ thuật, công cụ, cách giải quyết vấn đề, và các dự án nhỏ mình tự xây dựng." },
];

export default function AboutPage() {
  return (
    <>
      <div className="flex min-h-[calc(100svh-72px)] flex-col">
        <main className="flex-1 px-6 pb-24 pt-10 min-[992px]:ml-[50vw] min-[992px]:px-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/about.jpg" alt="" className="cover-in mb-8 h-56 w-full rounded-lg object-cover opacity-75 min-[992px]:hidden" />
          <h1 style={{ "--i": 0 } as CSSProperties} className="reveal mb-6 font-[family-name:var(--font-heading)] text-4xl max-[1199px]:text-[32px] font-normal leading-[1.3]">Giới thiệu</h1>
          <div style={{ "--i": 1 } as CSSProperties} className="reveal prose-blog min-[992px]:max-w-[var(--content-width)]">
            <p>
              Xin chào, mình là Loc. Đây là nơi mình ghi lại ẩm thực, những nơi đã đi, trải nghiệm cuộc sống và chuyện lập trình trong thời gian sống tại Nhật Bản.
            </p>
            <p>
              Mình viết những điều mà ngày trước mình ước mình đã biết sớm hơn. Hy vọng chúng hữu ích với bạn nếu bạn đang chuẩn bị sang Nhật, mới đến, hoặc đơn giản là tò mò về cuộc sống ở đây.
            </p>

            <h2>Mình chia sẻ gì</h2>
            <ol>
              {topics.map((s) => (
                <li key={s.title}>
                  <strong>{s.title}</strong>
                  <br />
                  {s.body}
                </li>
              ))}
            </ol>

            <h2>Liên hệ</h2>
            <p>
              Nếu bạn có câu hỏi hoặc muốn trao đổi thêm, cứ nhắn cho mình.
              {site.email && (
                <>
                  {" "}Email: <a href={`mailto:${site.email}`}>{site.email}</a>.
                </>
              )}
            </p>

            <p>
              <Link href="/">Đọc bài viết →</Link>
            </p>
          </div>
        </main>
        <div className="min-[992px]:ml-[50vw]">
          <Footer />
        </div>
      </div>
    </>
  );
}
