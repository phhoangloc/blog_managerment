"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Desktop covers live in the layout so they crossfade by opacity instead of remounting.
// Other routes (the home page and posts) bring their own cover, which fades in on its own.
const COVERS: Record<string, string> = { "/about": "/about.jpg" };

const LEAVE_MS = 300;

export default function PageTransition() {
  const path = usePathname();
  const router = useRouter();

  // new page is in: stop fading the old content out
  useEffect(() => {
    document.body.classList.remove("leaving");
  }, [path]);

  // fade the current text out first, then navigate
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      e.preventDefault();
      e.stopPropagation();
      document.body.classList.add("leaving");
      clearTimeout(timer);
      timer = setTimeout(() => {
        router.push(url.pathname + url.search + url.hash);
        // safety net if the navigation never lands
        setTimeout(() => document.body.classList.remove("leaving"), 3000);
      }, LEAVE_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="fixed bottom-0 left-0 top-0 hidden w-[50vw] overflow-hidden min-[992px]:block" aria-hidden>
      {Object.entries(COVERS).map(([route, src]) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={route}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${path === route ? "opacity-75" : "opacity-0"}`}
        />
      ))}
    </div>
  );
}
