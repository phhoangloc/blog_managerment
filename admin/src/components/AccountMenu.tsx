"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearToken, getRole, Role } from "@/lib/auth";
import type { Account } from "@/lib/types";
import AccountForm from "./AccountForm";
import Avatar from "./Avatar";

// Avatar + name in the top-right corner; click opens a modal with the profile form and logout
export default function AccountMenu() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [me, setMe] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const r = getRole();
    setRole(r);
    if (r) {
      api<Account>(r === "admin" ? "/admins/me" : "/users/me")
        .then(setMe)
        .catch((e: Error) => setError(e.message));
    }
  }, []);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  if (!role) return null;
  const name = me?.username ?? (role === "admin" ? "Administrator" : "User");

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-end gap-3 px-8 pt-5">
        {/* only users write blogs; admins edit and delete */}
        {role === "user" && (
          <Link
            href="/blog/new"
            aria-label="New blog"
            title="New blog"
            // below 575px only a "+" icon is shown
            className="btn btn-primary max-[574px]:!h-[48px] max-[574px]:!w-[48px] max-[574px]:!p-0"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hidden max-[574px]:block"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            <span className="max-[574px]:hidden">New blog</span>
          </Link>
        )}
        <button
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Account: ${name}`}
          title={name}
          // below 575px only the avatar is shown
          className="flex cursor-pointer items-center gap-3 rounded-full bg-surface py-1.5 pl-1.5 pr-4 hover:bg-neutral-300 max-[574px]:p-1.5"
        >
          <Avatar name={name} url={me?.avatarUrl} size={36} />
          <span className="text-sm font-semibold max-[574px]:hidden">{name}</span>
        </button>
      </div>

      {open && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Profile" onClick={() => setOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <Avatar name={name} url={me?.avatarUrl} size={48} />
              <div className="flex flex-col">
                <h3 className="m-0 text-xl">{name}</h3>
                <span className="text-[13px] capitalize text-neutral-700">{role}</span>
              </div>
            </div>

            {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}
            {me && (
              <AccountForm
                key={me.updatedAt}
                endpoint={role === "admin" ? "/admins/me" : "/users/me"}
                method="PUT"
                initial={me}
                submitLabel="Save profile"
                withAvatar={role !== "admin"}
                onSaved={setMe}
              />
            )}

            <div className="mt-1 flex justify-between border-t border-[var(--color-divider)] pt-4">
              <button className="btn btn-secondary" onClick={logout}>Log out</button>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
