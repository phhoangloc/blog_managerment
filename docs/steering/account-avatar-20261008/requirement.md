# Requirement: account-avatar-20261008 (spec update in initital-idea.md)

## Changes from the updated spec
1. **Avatar** - `admin` and `user` get an `avatar` column that references `file.id` (nullable; deleting the file clears it).
2. **Admin can CRUD admin** - admin accounts: list, create, view, update, delete (not self-delete).
3. **User can edit myself** - already `GET/PUT /api/users/me`; extended to avatar. Admin gets the same via `GET/PUT /api/admins/me`.

## Rules
- username >= 6, password >= 6, valid email; username/email unique (409).
- `avatarId` must point to an existing file (400 otherwise); `null` removes the avatar.
- Responses never include password; they include `avatarId` and `avatarUrl`.
- An admin cannot delete their own account (400).

## API
| Method | Path | Who |
|---|---|---|
| GET/POST | /api/admins | admin |
| GET/PUT/DELETE | /api/admins/:id | admin |
| GET/PUT | /api/admins/me | admin |
| GET/PUT | /api/users/me | user |
| users CRUD | /api/users... | admin (now accept avatarId) |

## Admin web
- New "Admin" menu: list, create, edit, delete admins. Users get a "New user" button too.
- Account form with avatar upload (drag/click) shared by user/admin pages.
- Top-right account modal: edit own profile + avatar for both roles; avatar shown in the chip and lists.
