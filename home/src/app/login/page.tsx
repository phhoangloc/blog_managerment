"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import Footer from "@/components/Footer";
import { API_URL } from "@/lib/api";
import GoogleButton, { GOOGLE_CLIENT_ID } from "@/components/GoogleButton";
import { setToken } from "@/lib/auth";

// Readers log in as a `user` account to like and comment
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // store the token and go back to where the reader came from; only a local path is followed, never an arbitrary url
  function finish(token: string) {
    setToken(token);
    const next = params.get("next");
    router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
  }

  async function loginWithGoogle(idToken: string) {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Đăng nhập Google thất bại");
      finish(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập Google thất bại");
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", username, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Đăng nhập thất bại");
      finish(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "h-11 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 text-[15px] text-[var(--text-body)] outline-none focus:border-[var(--sea-500)]";

  return (
    <>
      {/* left cover is intentionally empty until an image is chosen */}
      <div className="cover-in fixed bottom-0 left-0 top-0 hidden w-[50vw] bg-[var(--bg-sunken)] min-[992px]:block" aria-hidden />
      <div className="flex min-h-[calc(100svh-72px)] flex-col">
        <main className="flex flex-1 flex-col justify-center px-6 pb-24 pt-10 min-[992px]:ml-[50vw] min-[992px]:px-14">
          <div className="reveal mx-auto w-full max-w-[400px]">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl max-[1199px]:text-[32px] font-normal">Đăng nhập</h1>
          <p className="mt-3 font-[family-name:var(--font-serif)] text-lg max-[1199px]:text-base text-[var(--text-muted)]">Đăng nhập để thích và bình luận.</p>
          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-[var(--text-subtle)]">
              Tên đăng nhập
              <input className={input} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-[var(--text-subtle)]">
              Mật khẩu
              <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </label>
            {error && (
              <p role="alert" className="m-0 text-sm text-[var(--accent)]">
                {error}
              </p>
            )}
            <button
              disabled={busy}
              className="mt-2 h-11 rounded-md bg-[var(--accent)] text-[15px] font-medium text-[var(--on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {busy ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>
          {GOOGLE_CLIENT_ID && (
            <div>
              <div className="my-6 flex items-center gap-3 text-xs text-[var(--text-faint)]">
                <span className="h-px flex-1 bg-[var(--border-default)]" />
                hoặc
                <span className="h-px flex-1 bg-[var(--border-default)]" />
              </div>
              <GoogleButton onToken={loginWithGoogle} onError={setError} />
            </div>
          )}
          </div>
        </main>
        <div className="min-[992px]:ml-[50vw]">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
