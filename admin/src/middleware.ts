import { NextRequest, NextResponse } from "next/server";

// Every page except /login needs the auth cookie set at login.
// A logged-in visitor who opens the site (or /login) directly lands on /blog, which both roles may use.
// The Dashboard sidebar link also points at "/", so only a direct visit (Sec-Fetch-Site: none) is redirected.
export function middleware(req: NextRequest) {
  const hasToken = req.cookies.get("admin_token")?.value;
  const isLogin = req.nextUrl.pathname === "/login";
  if (!hasToken && !isLogin) return NextResponse.redirect(new URL("/login", req.url));
  const directVisit = req.headers.get("sec-fetch-site") === "none";
  if (hasToken && (isLogin || (req.nextUrl.pathname === "/" && directVisit))) {
    return NextResponse.redirect(new URL("/blog", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
