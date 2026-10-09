# Architecture

## 1. Technology
| Concern | Choice |
|---|---|
| Runtime | Node.js |
| Web framework | Express 5 |
| Language | TypeScript |
| Database | MySQL |
| ORM | Prisma (`DATABASE_URL` from `.env`) |
| Validation | zod schemas |
| Auth | JWT bearer tokens, bcrypt (bcryptjs) password hashes |
| File upload | multipart parsing (multer, in memory, 10 MB limit), local disk storage |
| Tests | Jest, repositories mocked (no database needed) |

## 2. Layers
```
HTTP request
  -> routes        (wiring, role guard, validation)
  -> controller    (HTTP in/out only)
  -> service       (business rules, permissions)
  -> repository    (data access, Prisma)
  -> MySQL / disk
```
- **Controller** knows Express but no business rules.
- **Service** knows rules and ownership but not Express or Prisma; it depends on repository and storage *interfaces*.
- **Repository** is the only code that talks to Prisma.

## 3. SOLID and design patterns
| Principle / pattern | Where |
|---|---|
| Single responsibility | one controller + one service + one repository per entity |
| Dependency inversion | services receive `IAdminRepository`, `IUserRepository`, `IFileRepository`, `FileStorage`, `PasswordHasher`, `TokenService` through constructors |
| Open/closed | storage (`LocalFileStorage`) and hasher (`BcryptPasswordHasher`) can be swapped without touching services |
| Repository pattern | `repositories/interfaces.ts` + `prismaRepositories.ts` |
| Dependency injection / composition root | `routes/index.ts` builds and wires every object |
| Strategy | `FileStorage`, `PasswordHasher`, `TokenService` implementations |
| Middleware chain | `authenticate`, `requireRole`, `validateBody`, upload, error handler |

## 4. Cross-cutting concerns
- **Authentication:** `authenticate` verifies the JWT and sets `req.auth = { id, role }`; `requireRole` guards routes.
- **Authorization:** role checks in routes, ownership checks in services.
- **Errors:** services throw `AppError(status, message)`; the error middleware converts it (and unknown errors) to JSON.
- **Configuration:** `config/env.ts` reads `.env` (`DATABASE_URL`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `UPLOAD_DIR`); the seed script also reads `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_EMAIL`.

## 5. Data model
```
admin(id, username*, password, email*, createdAt, updatedAt)
user (id, username*, password, email*, avatarId -> file.id, createdAt, updatedAt)
file (id, name*, detail, filename, userId -> user.id (cascade), createdAt)
```
`*` = unique. `user.avatarId` is set to null when its file is deleted.

## 6. Deployment shape
A single Express process serving `/api/*` and static `/public/upload/*`; MySQL reachable through `DATABASE_URL`; uploads on local disk (`UPLOAD_DIR`).
