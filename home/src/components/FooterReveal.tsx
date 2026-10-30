"use client";

import { useEffect, useRef, useState } from "react";

// The footer keeps its place at the end of the page but stays below the clipped edge until
// the reader scrolls down to it, then slides up into view
export default function FooterReveal({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShown(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="overflow-hidden">
      <div className={`transition-transform duration-700 ease-out motion-reduce:transition-none ${shown ? "translate-y-0" : "translate-y-full"}`}>
        {children}
      </div>
    </div>
  );
}
