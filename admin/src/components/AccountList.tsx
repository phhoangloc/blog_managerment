"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/files";
import type { Account } from "@/lib/types";
import Avatar from "./Avatar";

interface Props {
  title: string;
  /** Base route, e.g. "/user" or "/admins"; API path is derived from `api` */
  route: string;
  apiPath: string;
  newLabel: string;
}

// Shared list page for users and admins: click a row to edit
export default function AccountList({ title, route, apiPath, newLabel }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Account[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Account[]>(apiPath)
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, [apiPath]);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-[44px]">{title}</h1>
          <p className="m-0 text-neutral-700">Click a row to edit or delete.</p>
        </div>
        <Link href={`${route}/new`} className="btn btn-primary">{newLabel}</Link>
      </header>
      {error && <p className="m-0 text-sm text-[#a63a2a]">{error}</p>}
      <div className="overflow-auto rounded-[28px] bg-neutral-100 px-4 py-2">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((u) => (
              <tr key={u.id} onClick={() => router.push(`${route}/${u.id}/edit`)} className="cursor-pointer hover:bg-neutral-200">
                <td>{u.id}</td>
                <td>
                  <span className="flex items-center gap-3 font-semibold">
                    <Avatar name={u.username} url={u.avatarUrl} size={32} />
                    {u.username}
                  </span>
                </td>
                <td>{u.email}</td>
                <td>{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows && rows.length === 0 && <p className="m-0 p-6 text-neutral-700">Nothing here yet.</p>}
      </div>
    </>
  );
}
