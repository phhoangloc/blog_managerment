// like / comment totals shown on a blog card and on the detail page
const icon = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg {...icon} fill={filled ? "currentColor" : "none"}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

export function CommentIcon() {
  return (
    <svg {...icon}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function Counts({ likes, comments }: { likes: number; comments: number }) {
  return (
    <div className="flex items-center gap-4 font-[family-name:var(--font-mono)] text-xs text-[var(--text-subtle)]">
      <span className="inline-flex items-center gap-1.5" title="Likes">
        <HeartIcon /> {likes}
      </span>
      <span className="inline-flex items-center gap-1.5" title="Comments">
        <CommentIcon /> {comments}
      </span>
    </div>
  );
}
