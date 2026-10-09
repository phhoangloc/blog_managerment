"use client";

import { useState } from "react";

export default function CopyLinkButton() {
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setDone(true);
      setTimeout(() => setDone(false), 2400);
    } catch {}
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-[var(--text-subtle)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-body)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
        </svg>
        Copy link
      </button>
      {done && (
        <div role="status" className="fixed bottom-7 left-1/2 z-40 -translate-x-1/2 rounded-md bg-[var(--success)] px-4 py-2.5 text-sm text-white shadow-lg">
          Link copied.
        </div>
      )}
    </>
  );
}
