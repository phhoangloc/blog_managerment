# Functional Design

## 1. Authentication
- `POST /api/auth/login` body `{ "role": "admin" | "user", "username", "password" }`.
- On success returns `{ "token": "<JWT>" }`; the token carries `id` and `role`.
- All other endpoints require `Authorization: Bearer <token>` and are checked for role (and ownership where noted).
- Invalid credentials: `401`. Missing/invalid token: `401`. Wrong role or not the owner: `403`.

## 2. Endpoints

### 2.1 Admins (admin only)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admins` | list admins |
| POST | `/api/admins` | create admin |
| GET | `/api/admins/me` | the logged-in admin |
| PUT | `/api/admins/me` | edit the logged-in admin |
| GET | `/api/admins/:id` | read one |
| PUT | `/api/admins/:id` | update one |
| DELETE | `/api/admins/:id` | delete one |

### 2.2 Users
| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | `/api/users` | admin | list users |
| POST | `/api/users` | admin | create user |
| GET | `/api/users/:id` | admin | read one |
| PUT | `/api/users/:id` | admin | update one |
| DELETE | `/api/users/:id` | admin | delete one |
| GET | `/api/users/me` | user | the logged-in user |
| PUT | `/api/users/me` | user | edit themselves |

`/me` routes are registered before `/:id` so `me` is never read as an id.

### 2.3 Files
| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | `/api/files` | admin: all, user: own | list |
| POST | `/api/files` | user | upload (`multipart/form-data`: `name`, `detail`, `file`) |
| GET | `/api/files/:id` | admin any, user own | read metadata |
| PUT | `/api/files/:id` | owner; admin too in the current code (see note) | edit name/detail (optionally replace the file) |
| DELETE | `/api/files/:id` | admin any, user own | delete record and stored file |

> Note: the idea only gives admins **view / delete** on files and users **upload / delete**. Editing a file is an extension for the owner. The current code also lets an admin call `PUT` on any file (the admin panel uses it); to follow the idea strictly, restrict `PUT` to the owner.

Static files are served from `/public/upload/<filename>`.

## 3. Rules and validation
- `username` and `password`: at least 6 characters. `email`: valid format. Validated with schemas before reaching the service (`400` on failure).
- `username` and `email` are unique per table (`409` on conflict).
- Passwords are hashed before storage and never returned.
- A user's `avatar` is a `file.id`; it must exist (`400` otherwise). Deleting the avatar file clears the reference.
- File `name` is unique and may contain letters, digits, `_` and `-` only (1-100 characters). `detail` is optional (max 50,000 characters). The upload must include a `file` part (400 if missing) of at most 10 MB.
- The stored filename is `<name><original extension>` and the URL is `/public/upload/<filename>`.
- Deleting a user deletes the files they own.
- A user may only act on files they own; an admin may view and delete any file.

## 4. Key flows
**Upload (user):** authenticate -> validate `name` -> reject duplicate name (409) -> write bytes to `/public/upload` -> create `file` row with `userId` = caller -> return metadata with `url`.

**Delete file (user or admin):** authenticate -> load file (404) -> check ownership unless admin (403) -> delete row -> remove stored file.

**Edit myself (user):** authenticate -> validate partial body (at least one field) -> check uniqueness against other accounts -> hash password if present -> update -> return the user without the password.

## 5. Error format
```json
{ "error": "human readable message" }
```
Statuses used: 400 validation (including upload size/format errors from multer), 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 500 unexpected.
