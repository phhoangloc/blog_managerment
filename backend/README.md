# User management API
Setup: `cp .env.example .env` (set DATABASE_URL), `npx prisma migrate dev`, `npm run seed`, `npm run dev`.
Test: `npm test`. Build: `npm run build && npm start`.
Endpoints: POST /api/auth/login; /api/users CRUD (admin); GET/POST /api/files, DELETE /api/files/:id (admin). Files served at /public/upload/<name>.<ext>.
