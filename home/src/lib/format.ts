// detail is rich-text HTML: reduce it to plain text for excerpts and read time
export const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export const excerptOf = (html: string, max = 200) => {
  const t = plainText(html);
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
};

export const readTime = (html: string) => {
  const words = plainText(html).split(" ").filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
};

// 2026.09.28
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
};
