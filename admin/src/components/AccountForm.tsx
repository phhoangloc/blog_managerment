"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { api, API_URL } from "@/lib/api";
import { getRole } from "@/lib/auth";
import type { Account, FileItem } from "@/lib/types";
import Avatar from "./Avatar";
import ImageUpload from "./ImageUpload";

interface Props {
  /** API path used for the request, e.g. "/users", "/admins/3" or "/users/me" */
  endpoint: string;
  method: "POST" | "PUT";
  initial?: Account | null;
  submitLabel: string;
  onSaved: (account: Account) => void;
  /** Extra buttons next to Save (e.g. Delete) */
  actions?: ReactNode;
  /** Admin accounts have no avatar */
  withAvatar?: boolean;
}

// Shared by user/admin create + edit pages and by the account modal: username, email, password, avatar
export default function AccountForm({ endpoint, method, initial, submitLabel, onSaved, actions, withAvatar = true }: Props) {
  const creating = method === "POST";
  // only users upload files, so an admin can see and remove an avatar but not upload a new one
  const [canUpload, setCanUpload] = useState(false);
  useEffect(() => setCanUpload(getRole() === "user"), []);
  const [username, setUsername] = useState(initial?.username ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setBusy(true);
    try {
      const body: Record<string, string | number | null> = { username, email };
      if (password) body.password = password;
      if (withAvatar && avatarFile) {
        // the avatar is a regular file; the account stores its id
        const form = new FormData();
        form.set("name", `avatar-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`);
        form.set("detail", "Avatar");
        form.set("file", avatarFile);
        body.avatarId = (await api<FileItem>("/files", { method: "POST", body: form })).id;
      } else if (withAvatar && removeAvatar) {
        body.avatarId = null;
      }
      const account = await api<Account>(endpoint, { method, body: JSON.stringify(body) });
      setPassword("");
      setAvatarFile(null);
      setRemoveAvatar(false);
      setSaved(true);
      onSaved(account);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const hasAvatar = !!initial?.avatarUrl && !removeAvatar;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {withAvatar && (
      <div className="field">
        <label>Avatar</label>
        {canUpload ? (
          <ImageUpload
            compact
            accept="image/*"
            file={avatarFile}
            onChange={(f) => {
              setAvatarFile(f);
              if (f) setRemoveAvatar(false);
            }}
            current={hasAvatar ? { url: `${API_URL}${initial!.avatarUrl}`, filename: "avatar.png" } : undefined}
          />
        ) : (
          <div className="flex items-center gap-3">
            <Avatar name={initial?.username ?? "?"} url={hasAvatar ? initial!.avatarUrl : null} size={56} />
            <span className="text-xs text-neutral-700">Only users can upload an avatar.</span>
          </div>
        )}
        {(hasAvatar || avatarFile) && (
          <button
            type="button"
            className="btn btn-ghost mt-1"
            onClick={() => {
              setAvatarFile(null);
              setRemoveAvatar(true);
            }}
          >
            Remove avatar
          </button>
        )}
      </div>
      )}
      <div className="field">
        <label htmlFor="acc-username">Username (min 6 characters)</label>
        <input id="acc-username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={6} />
      </div>
      <div className="field">
        <label htmlFor="acc-email">Email</label>
        <input id="acc-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="acc-password">{creating ? "Password (min 6 characters)" : "New password (leave empty to keep the current one)"}</label>
        <input id="acc-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required={creating} autoComplete="new-password" />
      </div>
      {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : submitLabel}</button>
        {actions}
        {saved && <span className="tag tag-sage">Saved</span>}
      </div>
    </form>
  );
}
