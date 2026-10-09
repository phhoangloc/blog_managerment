"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FileIcon from "@/components/FileIcon";
import { api } from "@/lib/api";
import { fileUrl, formatDate, isImage } from "@/lib/files";
import type { FileItem, User } from "@/lib/types";

export default function DashboardPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [files, setFiles] = useState<FileItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<User[]>("/users"), api<FileItem[]>("/files")])
      .then(([u, f]) => {
        setUsers(u);
        setFiles(f);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const images = files?.filter((f) => isImage(f.filename)).length;
  const stats = [
    { label: "Users", value: users?.length, note: "registered accounts" },
    { label: "Files", value: files?.length, note: "uploaded files" },
    { label: "Images", value: images, note: "image files" },
  ];
  const recent = files ? [...files].reverse().slice(0, 5) : [];

  return (
    <>
      <header>
        <span className="text-sm font-semibold text-accent-700">Overview</span>
        <h1 className="m-0 text-[44px]">Dashboard</h1>
      </header>
      {error && <p className="m-0 text-sm text-[#a63a2a]">{error}</p>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex flex-col gap-2">
            <span className="card-kicker">{s.label}</span>
            <span className="font-[family-name:var(--font-heading)] text-[40px] leading-none">{s.value ?? "–"}</span>
            <span className="text-xs text-neutral-700">{s.note}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-[26px]">Recent files</h2>
          <Link href="/file" className="btn btn-ghost">View all</Link>
        </div>
        <div className="flex flex-col gap-2">
          {recent.map((f) => (
            <Link key={f.id} href={`/file/${f.id}/edit`} className="flex items-center gap-4 rounded-2xl bg-neutral-100 p-4 hover:bg-neutral-200">
              {isImage(f.filename) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileUrl(f)} alt={f.name} className="washed h-14 w-14 flex-none rounded-2xl object-cover" />
              ) : (
                <FileIcon filename={f.filename} />
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{f.name}</span>
                <span className="text-[13px] text-neutral-700">{f.filename} · {formatDate(f.createdAt)}</span>
              </div>
            </Link>
          ))}
          {files && recent.length === 0 && <p className="m-0 text-neutral-700">No files yet.</p>}
        </div>
      </section>
    </>
  );
}
