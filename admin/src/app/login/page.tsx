"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { Role, setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ role, username, password }),
      });
      setToken(res.token, role);
      router.replace("/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="card flex w-full max-w-[400px] flex-col gap-4 p-8">
        <div className="mb-2 flex flex-col gap-1">
          <span className="card-kicker">Admin panel</span>
          <h1 className="m-0 text-4xl">Log in</h1>
        </div>
        <div className="flex gap-1 self-start rounded-full bg-neutral-200 p-1" role="radiogroup" aria-label="Login as">
          {(["admin", "user"] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={role === r}
              onClick={() => setRole(r)}
              className={`btn !px-5 !py-1.5 capitalize ${role === r ? "btn-primary" : "btn-ghost"}`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </div>
        {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}
        <button className="btn btn-primary mt-2" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
