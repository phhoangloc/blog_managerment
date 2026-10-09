# Requirement: comment-20261009 (docs/ideas/comment.md)

## Backend
Tables (Prisma + migration):
- `comment`: `userId` -> user (cascade), `blogId` -> blog (cascade), `content`, `hidden` (boolean, default false), timestamps.
- `like`: `userId` -> user (cascade), `blogId` -> blog (cascade), `like` (boolean). One row per (user, blog); liking again flips the boolean (unique `userId + blogId`).

Rules
- **User**: full CRUD on their own comments; can like / unlike a blog.
- **Admin**: can view, edit and delete **any** comment; **cannot like** (403) and cannot create comments (not in the idea).
- Only **published** blogs (`draft = false`) can be liked or commented on and have public comments.
- `hidden` is a moderation flag: only the admin may change it. Hidden comments are excluded from the public list and counts but stay visible to the admin (and to their author).
- Owner edits change `content` only. Content is trimmed, 1-2000 characters, plain text.
- Public blog responses gain `likeCount` (rows with `like = true`) and `commentCount` (non-hidden comments).

API (REST, JSON)
| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | `/api/public/blogs/:slug/comments` | public | visible comments of a published blog (author name, avatar url) |
| POST | `/api/blogs/:slug/comments` | user | add a comment |
| GET | `/api/blogs/:slug/like` | user | `{ like: boolean }` for the caller |
| PUT | `/api/blogs/:slug/like` | user | body `{ like: boolean }`, returns new counts |
| GET | `/api/comments` | admin all, user own | list (blog title, author, hidden) |
| GET/PUT/DELETE | `/api/comments/:id` | admin any, user own | read / edit / delete |
| GET | `/api/public/blogs` and `/:slug` | public | now include `likeCount`, `commentCount` |

WebSocket (`ws`, same HTTP server, path `/ws`)
- Clients subscribe to a blog (`{type:"subscribe", slug}`); anonymous clients may listen.
- Server pushes `comment:created`, `comment:updated`, `comment:deleted` and `like:changed` (with fresh counts) to subscribers of that blog, so every open page updates live.
- Writes stay on REST (they need auth + validation); the socket only broadcasts. Hidden comments are broadcast as `comment:deleted` to the public.

## Admin panel
- New navigation item **Comment** (admin only) -> `/comment`: list of all comments (blog, author, content, hidden badge, date).
- `/comment/:id/edit`: edit content and the `hidden` toggle; delete button.

## Home site
- Logging in is required to like and comment: new `/login` page (role `user`), token kept in localStorage; header shows login / logout. Reading stays public.
- `/` (blog list): each card shows like count and comment count.
- `/blog/:slug`: counts, **Like** button (toggle, filled when liked), **Comment** button (scrolls to the input), comment list and an input at the bottom of the blog. Logged-out visitors are sent to `/login` when they try to like or comment.
- Counts and comments update live over the WebSocket.
