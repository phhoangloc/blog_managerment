# Requirement: remove-admin-avatar-20261008 (initital-idea.md changed)
- `admin` table no longer has `avata`; only `user` keeps `avatarId` (file.id).
- Backend: drop `admin.avatarId` (migration `remove_admin_avatar`), admin create/update schemas and responses have no avatar fields; `AdminService` no longer depends on `AvatarResolver`.
- Web: admin forms (admin list/new/edit pages and the admin's top-right profile modal) show no avatar field; admin chip shows initials. Users keep their avatar (upload by the user only).
