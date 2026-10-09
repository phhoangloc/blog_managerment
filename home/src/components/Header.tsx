"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, authedFetch } from "@/lib/api";
import { clearToken, useAuth } from "@/lib/auth";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const path = usePathname();
  const { ready, token } = useAuth();
  const [me, setMe] = useState<{ username: string; avatarUrl: string | null } | null>(null);

  // the logged-in reader's name and avatar
  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }
    authedFetch<{ username: string; avatarUrl: string | null }>("/users/me", token)
      .then(setMe)
      .catch((err) => {
        setMe(null);
        // the token no longer maps to an account (deleted user, bad signature): log out
        if (err instanceof ApiError && [401, 403, 404].includes(err.status)) clearToken();
      });
  }, [token]);
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
          {ready &&
            (token ? (
              <div className="flex items-center gap-3">
                <Avatar name={me?.username ?? "?"} url={me?.avatarUrl ?? null} size={28} />
                <button type="button" onClick={clearToken} className="font-[family-name:var(--font-ui)] text-[15px] text-[var(--text-subtle)] hover:text-[var(--text-body)]">
                  logout
                </button>
              </div>
            ) : (
              link("/login", "login", path === "/login")
            ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
