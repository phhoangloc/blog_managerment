"use client";

import { useEffect, useRef } from "react";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// the slice of Google Identity Services that is used here
interface GoogleId {
  initialize(config: { client_id: string; callback: (r: { credential: string }) => void }): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const SCRIPT = "https://accounts.google.com/gsi/client?hl=vi";

function loadScript(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    const script = existing ?? Object.assign(document.createElement("script"), { src: SCRIPT, async: true });
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Không tải được đăng nhập Google")));
    if (!existing) document.head.appendChild(script);
  });
}

// "Đăng nhập bằng Google": Google returns an ID token that onToken sends to the backend
export default function GoogleButton({ onToken, onError }: { onToken: (idToken: string) => void; onError: (message: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onToken, onError });
  useEffect(() => {
    handlers.current = { onToken, onError };
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (r) => handlers.current.onToken(r.credential),
        });
        window.google.accounts.id.renderButton(box.current, { type: "standard", theme: "outline", size: "large", text: "signin_with", locale: "vi", width: 400 });
      })
      .catch((e: Error) => handlers.current.onError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  // without a client id the button is hidden
  if (!GOOGLE_CLIENT_ID) return null;
  return <div ref={box} className="flex min-h-[44px] justify-center" />;
}
