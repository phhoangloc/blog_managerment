"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getRole, getToken } from "@/lib/auth";

// A plain user may only use File (their own files) and Blog (their own posts); everything else is admin-only.
// Admins edit/delete blogs but never write them, so /blog/new and /blog/myblog are users-only.
export const isAllowed = (role: string | null, pathname: string) => {
  const path = pathname.replace(/\/$/, "");
  if (role === "admin") return path !== "/blog/new" && path !== "/blog/myblog";
  return role === "user" && (path.startsWith("/file") || path.startsWith("/blog"));
};

// Second line of defence behind middleware.ts: a stale cookie without a stored token still gets bounced
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const role = getRole();
    if (!getToken() || !role) {
      clearToken(); // drop a stale cookie, otherwise middleware bounces /login back to /
      router.replace("/login");
    } else if (!isAllowed(role, pathname)) {
      setOk(false);
      router.replace("/blog"); // both roles may use /blog
    } else {
      setOk(true);
    }
  }, [router, pathname]);

  return ok ? <>{children}</> : null;
}
