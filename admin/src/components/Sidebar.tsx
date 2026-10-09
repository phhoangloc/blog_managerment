"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getRole, Role } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Dashboard", icon: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"] },
  {
    href: "/user",
    label: "User",
    icon: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  },
  {
    href: "/blog",
    label: "Blog",
    icon: ["M12 20h9", "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"],
  },
  {
    href: "/comment",
    label: "Comment",
    icon: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  },
  { href: "/file", label: "File", icon: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<Role | null>(null);
  useEffect(() => setRole(getRole()), []);
  // a plain user only sees File and Blog
  const items = role === "user" ? NAV.filter((n) => n.href === "/file" || n.href === "/blog") : NAV;

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // below 768px the menu collapses to icons only
  return (
    <aside className="flex w-[248px] flex-none flex-col gap-6 rounded-r-[28px] bg-surface px-4 py-6 max-[767px]:w-[72px] max-[767px]:px-2">
      <div className="flex items-center gap-3 px-2 max-[767px]:justify-center max-[767px]:px-0">
        <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-accent font-[family-name:var(--font-heading)] text-xl text-neutral-100">
          a
        </div>
        <div className="font-[family-name:var(--font-heading)] text-[22px] leading-none max-[767px]:hidden">admin</div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active(n.href) ? "page" : undefined}
            aria-label={n.label}
            title={n.label}
            className={`flex items-center gap-3 rounded-full px-4 py-3 text-[15px] font-semibold transition-colors max-[767px]:justify-center max-[767px]:px-0 ${
              active(n.href) ? "bg-accent text-neutral-100" : "hover:bg-neutral-300"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
              {n.icon.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
            <span className="max-[767px]:hidden">{n.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
