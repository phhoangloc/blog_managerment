import { assetUrl } from "@/lib/api";

// Round avatar: the uploaded image, or the first letters of the name
export default function Avatar({ name, url, size = 36 }: { name: string; url: string | null; size?: number }) {
  const src = assetUrl(url);
  const box = { width: size, height: size };
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} style={box} className="flex-none rounded-full object-cover" />
  ) : (
    <span
      style={{ ...box, fontSize: Math.max(10, Math.round(size / 3)) }}
      className="grid flex-none place-items-center rounded-full bg-[var(--bg-sunken)] font-[family-name:var(--font-mono)] text-[var(--text-subtle)]"
      title={name}
    >
      {name.slice(0, 2).toUpperCase() || "?"}
    </span>
  );
}
