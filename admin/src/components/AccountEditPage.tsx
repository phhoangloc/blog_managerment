"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Account } from "@/lib/types";
import AccountForm from "./AccountForm";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  label: string; // "user" | "admin"
  route: string; // "/user" | "/admins"
  apiPath: string; // "/users" | "/admins"
}

// Shared edit (and delete) page for users and admins
export function AccountEditPage({ label, route, apiPath }: Props) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Account>(`${apiPath}/${id}`)
      .then(setAccount)
      .catch((e: Error) => setError(e.message));
  }, [apiPath, id]);

  async function remove() {
    setBusy(true);
    try {
      await api(`${apiPath}/${id}`, { method: "DELETE" });
      router.replace(route);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setConfirming(false);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href={route} className="btn btn-ghost self-start">← {label}</Link>
        <h1 className="m-0 text-[44px] capitalize">Edit {label} #{id}</h1>
      </div>

      {error && <p className="m-0 text-sm text-[#a63a2a]" role="alert">{error}</p>}

      {account && (
        <div className="card max-w-[520px]">
          <AccountForm
            key={account.updatedAt}
            endpoint={`${apiPath}/${id}`}
            method="PUT"
            initial={account}
            submitLabel="Save"
            withAvatar={label !== "admin"}
            onSaved={setAccount}
            actions={
              <button type="button" className="btn btn-secondary" onClick={() => setConfirming(true)}>
                Delete {label}
              </button>
            }
          />
        </div>
      )}

      {confirming && account && (
        <ConfirmDialog
          title={`Delete ${label}?`}
          message={`"${account.username}" will be permanently deleted.`}
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

export function AccountNewPage({ label, route, apiPath }: Props) {
  const router = useRouter();
  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href={route} className="btn btn-ghost self-start">← {label}</Link>
        <h1 className="m-0 text-[44px] capitalize">New {label}</h1>
      </div>
      <div className="card max-w-[520px]">
        <AccountForm endpoint={apiPath} method="POST" withAvatar={label !== "admin"} submitLabel={`Create ${label}`} onSaved={() => router.replace(route)} />
      </div>
    </>
  );
}
