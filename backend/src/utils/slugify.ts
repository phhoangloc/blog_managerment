// "Một tuần ở Đà Lạt!" -> "mot-tuan-o-da-lat"
export function slugify(text: string): string {
  return (
    text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 150) || 'blog'
  );
}

// Appends -2, -3, ... until `isTaken` says the slug is free
export async function uniqueSlug(base: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> {
  let candidate = base;
  for (let n = 2; await isTaken(candidate); n++) candidate = `${base}-${n}`;
  return candidate;
}
