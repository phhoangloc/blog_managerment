import { site } from "@/lib/site";

const label = "font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[var(--tracking-caps)] text-[var(--sea-300)]";
const link = "text-[15px] text-[var(--paper-1)] no-underline hover:text-[var(--sea-100)]";

export default function Footer() {
  return (
    <footer data-theme="dark" className="mt-24 bg-[var(--sea-900)] px-7 pb-7 pt-12 text-[var(--paper-1)] [word-break:auto-phrase]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <div className="font-[family-name:var(--font-serif)] text-[32px] max-[1199px]:text-[28px] font-medium">locpham</div>
          <p className="mt-3.5 max-w-[26em] font-[family-name:var(--font-serif)] text-[17px] max-[1199px]:text-base leading-relaxed text-[var(--sea-100)]">
            日本で出会えるベトナムの味を、あなたのもとへ。お気に入りの一軒が見つかりますように。
          </p>
        </div>
        {site.email && (
          <div className="flex flex-col gap-3.5">
            <span className={label}>連絡先</span>
            <a className={link} href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        )}
        {(site.instagram || site.github) && (
          <div className="flex flex-col gap-3.5">
            <span className={label}>その他</span>
            {site.instagram && <a className={link} href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            {site.github && <a className={link} href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          </div>
        )}
      </div>
      <div className="mx-auto mt-9 flex max-w-5xl justify-between border-t border-[rgba(241,250,238,.14)] pt-4 font-[family-name:var(--font-mono)] text-xs text-[var(--sea-300)]">
        <span>手で書き、少数が読む</span>
        <span>2019 — {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
