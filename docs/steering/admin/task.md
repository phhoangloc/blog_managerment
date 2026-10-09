# Tasks: admin
## Backend gaps
- [x] B1. Prisma: `File.detail` -> `@db.Text`, migrate
- [x] B2. Validators: larger detail limit, `updateFileSchema`
- [x] B3. FileService `get` / `update` (+ replace stored file), FileController, routes `GET/PUT /files/:id`
- [x] B4. Backend tests for the new FileService methods; port 4000 in `.env`, `.env.example`, `test.rest`
## Admin app
- [x] A1. Scaffold Next.js + TS + Tailwind in `/admin`, `.env.example`/`.env.local`
- [x] A2. Design tokens in Tailwind/globals.css, fonts
- [x] A3. lib: api, auth, types, files helpers
- [x] A4. Login page, middleware, AuthGuard, panel layout with Sidebar
- [x] A5. Dashboard page
- [x] A6. User list + user edit/delete
- [x] A7. ImageUpload and RichTextBox components
- [x] A8. File list (upload dialog, image/icon rows) + file edit/delete
## Verify
- [x] V1. Backend `tsc` + `jest` pass
- [x] V2. Admin `next build` + lint/typecheck pass
- [x] V3. Run both; check login redirect, user edit, file upload/edit/delete in the browser
