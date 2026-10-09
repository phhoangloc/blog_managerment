# Requirement: home (ideas/home.md)

Public reader site in `/home` (Next.js + TypeScript + Tailwind). Layout/tokens taken from the Claude Design project
"locpham design system" (Summer Ocean Breeze palette, Newsreader/Geist/JetBrains Mono, fixed transparent header with
wordmark + `blog` / `about` nav + dark-mode toggle, big-card blog list, split-screen detail/about with a fixed 50vw image on the left, contact footer).

## Backend (additions)
The blog API is auth-only, so add read-only **public** endpoints (no token):
- `GET /api/public/blogs` -> published blogs only (`draft=false`), newest first, with `coverUrl` + `authorName`.
- `GET /api/public/blogs/:slug` -> one published blog (404 for drafts / unknown slug).

## Frontend (`/home`)
- Config: `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`) from `.env.local` / `.env.example`.
- `/` view all blogs: big cards (cover, date, `#category`, read time, title, excerpt). Click -> `/blog/[slug]`. Count line, contact footer.
- `/about` about page: split layout, portrait area + prose.
- `/blog/[slug]` detail: fixed left cover image, right column with meta, title, excerpt, sanitized rich-text body (DOMPurify), prev/next link, copy-link toast.
- Header: wordmark, nav, light/dark toggle (persisted in localStorage, `data-theme`).
- Design deliberately dropped from the mock: likes/comments/share counters, passphrase gate, subscribe form (no backend support).
- Loading / empty / 404 / API-error states.
