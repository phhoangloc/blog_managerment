"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const path = usePathname();
  // on split-layout pages (blog detail, about; md+) the left half is an image panel, so the logo moves to the start of the content column
  // (50vw + the column's 56px padding - the header's 24px gutter)
  const splitLayout = path.startsWith("/blog/") || path === "/about";
  const link = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`font-[family-name:var(--font-ui)] text-[15px] no-underline ${
        active ? "text-[var(--text-body)] underline decoration-[var(--accent)] decoration-2 underline-offset-8" : "text-[var(--text-subtle)] hover:text-[var(--text-body)]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-30 h-[72px]">
      <div className="flex h-full items-center justify-between gap-6 px-[var(--page-gutter)]">
        <Link href="/" className={`font-[family-name:var(--font-serif)] text-[22px] font-medium tracking-[var(--tracking-display)] no-underline ${splitLayout ?"md:ml-[calc(50vw+32px)]" : ""} text-[var(--text-body)] hover:text-[var(--text-body)]`}>
          locpham
        </Link>
        <nav className="flex items-center gap-6">
          {link("/", "blog", path === "/" || path.startsWith("/blog"))}
          {link("/about", "about", path === "/about")}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
