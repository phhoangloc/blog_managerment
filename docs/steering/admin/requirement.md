# Requirement: admin (Next.js admin panel)

Source: `docs/ideas/admin-idea.md`, layout from the Claude Design project "Blog Admin Template" (Organic design system: cream/terracotta/sage palette, pill buttons, rounded sidebar, Paytone One headings).

## Goal
A web admin panel in `/admin` that talks to the existing `/backend` REST API. Only a logged-in admin can use it.

## Tech
Next.js (App Router), TypeScript, Tailwind CSS. API base URL from `.env` (`NEXT_PUBLIC_API_URL`, default `http://localhost:4000`).

## Functional requirements
1. **Login required** - every page except `/login` redirects to `/login` when there is no valid admin token. Login calls `POST /api/auth/login` with `role: "admin"`. Logout clears the token. A 401 from the API logs the user out.
2. **Navigation** (sidebar): Dashboard, User, File. Footer shows the logged-in admin and a logout action.
3. **Dashboard (`/`)**: counts of users and files, recent files, using existing list endpoints.
4. **User list (`/user`)**: admin can view all users (id, username, email, created). Row click opens edit.
5. **User edit (`/user/:id/edit`)**: admin can edit (username, email, optional new password) and delete (with confirm dialog).
6. **File list (`/file`)**: "Upload" button opens an upload form (name, detail via rich text box, file via image-upload box). Files are shown as rows: if the file is an image show a thumbnail, otherwise a file-type icon. Shows name, detail summary, uploader, date.
7. **File edit (`/file/:id/edit`)**: edit name and detail, replace the file; the image-upload box shows the current image when the file is an image. Delete with confirm.

## Components
- **Navigation** - sidebar (Dashboard / User / File).
- **ImageUpload box** - drag-and-drop and click-to-select; shows preview.
- **RichTextBox** - for long text. Toolbar: H1-H5, **B**, *I*, U, URL link, image URL, image upload (uploads to the backend, then inserts the image at the cursor position).

## Backend changes required (gaps found)
- `GET /api/files/:id` and `PUT /api/files/:id` (admin only; multipart with optional new file; updates name/detail).
- `File.detail` must hold rich text HTML: change column to `TEXT` (migration) and raise the validator limit.
- Backend port `4000` (spec default); update `.env`, `.env.example`, `test.rest`.

## Out of scope
Creating users from the UI (not in the route list), admin management, i18n, dark mode.
