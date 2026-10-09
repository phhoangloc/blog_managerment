import { extOf } from "@/lib/files";

// Generic file icon (Lucide "file") with the extension underneath
export default function FileIcon({ filename, size = 56 }: { filename: string; size?: number }) {
  return (
    <div
      className="flex flex-none flex-col items-center justify-center gap-0.5 rounded-2xl bg-accent-100 text-accent-800"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
      <span className="text-[10px] font-bold uppercase leading-none">{extOf(filename).slice(0, 4)}</span>
    </div>
  );
}
