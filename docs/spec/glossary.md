# Glossary

| Term | Meaning |
|---|---|
| Admin | Staff account that manages admins, users and all files. Stored in the `admin` table. |
| User | End-user account that manages itself and its own files. Stored in the `user` table. |
| Role | `admin` or `user`; chosen at login and carried in the token. |
| Token | JWT returned by `POST /api/auth/login` and sent as `Authorization: Bearer <token>`. |
| File | A record in the `file` table (`name`, `detail`, `userId`) plus the stored bytes in `/public/upload`. |
| Owner | The user referenced by `file.userId`. Only the owner (or an admin) can delete the file. |
| Avatar | A user's profile picture: `user.avatarId`, a reference to `file.id`. (The source idea spells it "avata".) |
| Name | The unique file name given at upload; it is used to build the stored filename and the URL. |
| Filename | `<name><extension>` as saved on disk, e.g. `photo-1.png`. |
| URL | `/public/upload/<filename>`, served statically by the API. |
| Controller | Layer that handles HTTP requests and responses. |
| Service | Layer that applies business rules and permissions. |
| Repository | Layer that reads and writes the database through Prisma. |
| Composition root | The single place (`routes/index.ts`) where concrete classes are created and injected. |
| Prisma | The ORM used to access MySQL. |
| Seed | Script that creates the first admin from `SEED_ADMIN_*` variables. |
| Steering | Per-feature notes (`requirement.md`, `structure.md`, `task.md`) kept in `docs/steering/`. |
