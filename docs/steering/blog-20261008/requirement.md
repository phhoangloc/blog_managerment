# Requirement: blog-20261008 (ideas/blog-idea.md)

## Backend
Table `blog`: title, slug, detail, category, draft (default true), cover (file.id), author.
- **Admin** can CRUD every blog. **User** can CRUD their own blogs only (403 on others).
- Assumptions (blog-idea says `author(user.id)` but admins also write blogs):
  - `author` is stored as `authorRole` (admin|user) + `authorId`, same pattern as file uploader. Responses add `authorName`.
  - `category` is free text (default "General").
  - `slug` is generated from the title (unique; `-2`, `-3` appended on clash) and used in URLs; it only changes when explicitly provided on update.
  - `cover` is `coverId` -> `file.id` (nullable, 400 if the file doesn't exist; file deletion clears it). Responses add `coverUrl`.
  - `draft` defaults to `true`; publishing = `draft: false`.
- API (`/api/blogs`, authenticated): `GET` list (admin: all, user: own), `POST`, `GET /:slug`, `PUT /:slug`, `DELETE /:slug`.

## Frontend (admin app)
- Navigation item **Blog** (admin and user).
- `/blog` list; `/blog/:slug/view` read-only view (rich text rendered sanitized); `/blog/:slug/edit` edit; `/blog/new` create.
- Edit form: title, slug, category, draft toggle, cover (image drop box), detail (rich text box).
- Users only see/edit their own blogs (backend-enforced).
