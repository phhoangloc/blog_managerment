import { site } from "@/lib/site";

const label = "font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[var(--tracking-caps)] text-[var(--sea-300)]";
const link = "text-[15px] text-[var(--paper-1)] no-underline hover:text-[var(--sea-100)]";

export default function Footer() {
  return (
    <footer data-theme="dark" className="mt-24 bg-[var(--sea-900)] px-7 pb-7 pt-12 text-[var(--paper-1)]">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-[family-name:var(--font-serif)] text-[32px] font-medium">locpham</div>
          <p className="mt-3.5 max-w-[26em] font-[family-name:var(--font-serif)] text-[17px] leading-relaxed text-[var(--sea-100)]">
            Thanks for reading this far. If something here made you think of me, say hi.
          </p>
        </div>
        {site.email && (
          <div className="flex flex-col gap-3.5">
            <span className={label}>Contact</span>
            <a className={link} href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        )}
        {(site.instagram || site.github) && (
          <div className="flex flex-col gap-3.5">
            <span className={label}>Elsewhere</span>
            {site.instagram && <a className={link} href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            {site.github && <a className={link} href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          </div>
        )}
      </div>
      <div className="mx-auto mt-9 flex max-w-5xl justify-between border-t border-[rgba(241,250,238,.14)] pt-4 font-[family-name:var(--font-mono)] text-xs text-[var(--sea-300)]">
        <span>written by hand, read by few</span>
        <span>2019 — {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
