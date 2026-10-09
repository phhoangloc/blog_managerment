# Requirement: file-owner-20261008 (initital-idea.md changed)

## Changes
1. `file` gets `userId` (user.id) - the owner. Replaces uploaderRole + uploaderId; deleting a user deletes their files (cascade).
2. **Admin** can view / delete files (no upload).
3. **User** can upload / delete their own files.

## Rules
- `POST /api/files`: role `user` only; `userId` = logged-in user.
- `GET /api/files`: admin all, user own. `GET/PUT/DELETE /api/files/:id`: admin any, user only own (403 otherwise).
- Admin editing file details (`PUT`) is kept because the admin panel has `/file/:id/edit`; the spec does not forbid it.
- Responses add `userName` (owner username).
- Consequence: admins cannot upload, so the admin avatar upload box is removed (admin can still remove an avatar). Users upload their own avatar/cover/inline images.
- Web: admin sees no Upload button; users open their own files at `/file/:id/edit`.
