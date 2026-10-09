# Structure: admin

```
admin/
  package.json, tsconfig.json, next.config.ts, postcss.config.mjs, .env.example, .env.local
  src/
    middleware.ts                # redirect to /login when auth cookie is missing
    app/
      layout.tsx, globals.css    # fonts + design tokens (Organic) as Tailwind theme
      login/page.tsx
      (panel)/layout.tsx         # AuthGuard + Sidebar shell
      (panel)/page.tsx           # dashboard
      (panel)/user/page.tsx
      (panel)/user/[id]/edit/page.tsx
      (panel)/file/page.tsx
      (panel)/file/[id]/edit/page.tsx
    components/
      Sidebar.tsx, AuthGuard.tsx, ConfirmDialog.tsx, FileIcon.tsx
      ImageUpload.tsx            # drag-and-drop + click
      RichTextBox.tsx            # contentEditable editor + toolbar
      FileForm.tsx               # shared by upload dialog and edit page
    lib/
      api.ts                     # fetch wrapper: base URL, bearer token, 401 handling
      auth.ts                    # token storage (localStorage + cookie)
      types.ts, files.ts         # isImage(), fileUrl()
```

## Design mapping
- Tailwind theme extends colors `bg #f5ead8`, `surface #ebddc5`, `text #201e1d`, `accent #c67139`, `accent2 #7a8a5e` and the 100-900 ramps from the design `styles.css`; radii `md 16px`, `lg 28px`; pill buttons/inputs; fonts Paytone One (headings) + Be Vietnam Pro (body).
- Layout: grid `sidebar | main`; sidebar is a rounded-right surface panel with pill nav items (active = accent fill).

## Key decisions
- Token: JWT stored in `localStorage` and a cookie (cookie lets `middleware.ts` guard routes); `api.ts` clears both on 401.
- Rich text stored as sanitized HTML in `file.detail`; rendered after sanitizing with DOMPurify.
- Image URLs from the backend are `${API_URL}/public/upload/<filename>`.
- Image detection by file extension (png, jpg, jpeg, gif, webp, svg).

## Backend changes
`backend/prisma/schema.prisma` (detail `@db.Text` + migration), `validators/schemas.ts` (detail limit, `updateFileSchema`), `services/FileService.ts` (`get`, `update`), `controllers/FileController.ts`, `routes/index.ts`, tests in `tests/services/FileService.test.ts`, `.env`/`.env.example`/`test.rest` (port 4000).
