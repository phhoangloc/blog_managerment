# Requirement: blog-update-20261008 (ideas/blog-idea.md changed)

## Changes
1. **Admin can only edit and delete blogs** - admin no longer creates blogs. Admin still sees all blogs.
2. **User can CRUD their own blogs** - unchanged.
3. **author = user.id** - because only users create blogs, `author` becomes a real foreign key to `user` (replaces authorRole + authorId). Deleting a user deletes their blogs (cascade).
4. **Edit page lets admin edit and delete** (delete button on `/blog/:slug/edit`, also for the owner).

## Rules
- `POST /api/blogs`: role `user` only (admin gets 403).
- `GET/PUT/DELETE /api/blogs/:slug`: admin any blog; user only own (403 otherwise).
- Frontend: admin sees no "New blog" button and `/blog/new` redirects admin to `/blog`.
