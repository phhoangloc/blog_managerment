import { assetUrl } from "@/lib/api";

// Plain <img>: covers come from the backend's upload folder, not a known remote pattern
// The caller sets the positioning (relative / fixed) since both would clash in one class list
// `fadeRight` melts the right edge into the page background (split layout)
// `zoom` scales the image to 1.05 when the parent `group` is hovered
// `muted` desaturates and fades the image into the page background (detail page)
const FADE_MASK = "linear-gradient(to right, #000 62%, transparent 100%)";
const FADE_RIGHT = { maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK };

export default function CoverImage({
  src,
  alt,
  className = "relative",
  muted = false,
  fadeRight = false,
  zoom = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  muted?: boolean;
  fadeRight?: boolean;
  zoom?: boolean;
}) {
  const url = assetUrl(src);
  return (
    <div className={`cover-in overflow-hidden bg-[var(--bg-sunken)] ${className}`} style={fadeRight ? FADE_RIGHT : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && (
        <img
          src={url}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover ${zoom ? "transition-transform duration-500 group-hover:scale-105" : ""} ${muted ? "opacity-[0.82] contrast-[0.9] saturate-[0.55]" : ""}`}
        />
      )}
    </div>
  );
}
