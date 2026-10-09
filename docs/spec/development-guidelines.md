# Development Guidelines

## Language and style
- All code, comments, commit messages and documentation are in English.
- TypeScript in strict mode; avoid `any`.
- Prefer small functions and early returns; comments explain *why*, not *what*.

## Layering rules
1. Controllers only translate HTTP to a service call and back. No business rules.
2. Services hold the rules (uniqueness, ownership, permissions). They never import Express or Prisma.
3. Repositories are the only place that uses Prisma. Services depend on `I*Repository` interfaces.
4. Objects are created in one place (`routes/index.ts`) and injected through constructors.

## Security
- Hash passwords (bcrypt); never return a password field.
- Read secrets (`JWT_SECRET`, `DATABASE_URL`) only from the environment. Do not commit `.env`.
- Validate every body with a zod schema before it reaches a service.
- Enforce authorization twice: role in the route, ownership in the service.
- Build stored filenames from the validated `name` and the lower-cased original extension only; never trust the client path.

## Errors
- Throw `AppError(status, message)` from services; let the error middleware format the response.
- Use 400 validation, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict.

## Database
- Change the schema only through Prisma migrations (`npm run prisma:migrate`); commit the generated SQL.
- Keep the seed idempotent (`npm run seed` creates the admin only if absent).

## Testing
- Unit-test every service and middleware with Jest; mock repositories and storage so no database is required.
- Cover the happy path, each error status, and each permission rule (admin vs. owner vs. other user).
- Run `npm test` and `npx tsc --noEmit` before every commit.

## Git
- Small commits with an imperative subject line ("Add file ownership check").
- Do not commit `node_modules`, build output, `.env`, or uploaded files.

## Commands
| Command | Purpose |
|---|---|
| `npm run dev` | start with auto-reload |
| `npm run build` / `npm start` | compile and run |
| `npm test` | run unit tests |
| `npm run prisma:generate` / `prisma:migrate` | client and migrations |
| `npm run seed` | create the first admin |
