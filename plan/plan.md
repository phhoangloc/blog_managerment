# Plan: User-management REST API (backend)

## Context
Greenfield project (`blog_managerment`, no code yet). Spec: `ideas/initital-idea.md` (copied to `docs/spec/spec.md`). Build a basic RESTful API in `/backend` with Node.js + Express + TypeScript + MySQL via Prisma. Admins log in, CRUD users, upload/delete files; users log in and upload files. Files are stored in `/public/upload` and addressed by URL built from name. Layering: controller -> service -> repository, SOLID, design patterns. Environment: Node 22, npm 11; **MySQL is not installed locally**, so tests mock repositories (no DB needed); DB access is verified via `prisma validate`/`generate` and, if the user supplies a DB in `.env`, `prisma migrate`.

Assumptions (flag if wrong): JWT auth (bcrypt password hashing); separate `admin`/`user` tables, login body has `role`; `file.name` unique and used as URL (`/public/upload/<name>`), `detail` = description; file also stores stored filename/uploader; tests with Jest + ts-jest + supertest-free unit tests (service + middleware).

## Structure (`/backend`)
```
backend/
  package.json, tsconfig.json, jest.config.js, .env.example, .gitignore
  prisma/schema.prisma
  public/upload/.gitkeep
  src/
    app.ts, server.ts
    config/env.ts            # reads .env
    config/prisma.ts         # PrismaClient singleton
    controllers/  auth|user|file .controller.ts
    services/     auth|user|file .service.ts (+ interfaces)
    repositories/ interfaces + prisma impls: admin|user|file
    middleware/   auth.middleware.ts (JWT verify, requireRole), validate.middleware.ts (zod), upload.middleware.ts (multer), error.middleware.ts
    validators/   zod schemas (username>=6, password>=6, valid email)
    utils/        AppError, password hasher (Strategy), token service
    routes/       index, auth, user, file
  tests/services/*.test.ts, tests/middleware/*.test.ts
```
Patterns: Repository (interfaces; DI via constructor -> Dependency Inversion), Strategy (PasswordHasher / TokenService abstractions), Factory/composition root in `routes/index.ts` wiring dependencies, Singleton (Prisma client), Middleware chain.

## Prisma models
- `Admin`, `User`: id, username (unique, >=6 validated in API), password (hash), email (unique), createdAt/updatedAt.
- `File`: id, name (unique), detail, path, uploadedByRole/uploadedById, createdAt.

## API
- `POST /api/auth/login` {role, username, password} -> JWT
- Admin only: `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id`
- `POST /api/files` (multipart: file, name, detail) admin or user; saved to `public/upload`, url = `/public/upload/<name>`
- `DELETE /api/files/:id` admin only (removes record + disk file); `GET /api/files` any authenticated
- Static serve `/public/upload`.
- Seed script creates initial admin (from env) since no admin signup exists.

## Task order (→ `/task/task.md`, also `/plan/plan.md`)
1. Scaffold project, deps (express, prisma, @prisma/client, zod, bcryptjs, jsonwebtoken, multer, dotenv; dev: typescript, ts-node-dev, jest, ts-jest, @types/*).
2. Prisma schema + config + `prisma generate`.
3. Utils, repositories, services, validators.
4. Middleware, controllers, routes, app/server, seed.
5. Tests for services and middleware (mock repositories) ; run; fix.
6. Verification: `tsc --noEmit`, `jest`, `prisma validate`, boot app smoke check of non-DB routes (e.g. 401 unauthorised, validation 400).

## Verification
`npm run build`, `npm test` all pass; `npx prisma validate` ok; start server and curl unauthenticated/invalid requests; with a user-provided MySQL `DATABASE_URL`, run `prisma migrate dev` + seed and exercise login/CRUD/upload.
