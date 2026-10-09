# Structure: comment-20261009
Backend: `prisma/schema.prisma` (Comment, Like, relations) + migration, `repositories/interfaces.ts` + `prismaRepositories.ts` (ICommentRepository, ILikeRepository, blog counts),
`validators/schemas.ts` (createComment/updateComment/likeSchema), `services/CommentService.ts`, `services/LikeService.ts`, `services/RealtimeHub.ts` (WebSocket broadcast, interface `Broadcaster`),
`controllers/CommentController.ts`, `controllers/LikeController.ts`, `routes/index.ts`, `server.ts` (attach `ws` to the HTTP server), `BlogService.ts` (counts in public responses),
tests `CommentService.test.ts`, `LikeService.test.ts`, `RealtimeHub.test.ts`, schema cases in validate test.
Admin: `lib/types.ts` (Comment), `components/Sidebar.tsx` (+Comment, admin only), `AuthGuard.tsx` (/comment admin only), pages `comment/page.tsx`, `comment/[id]/edit/page.tsx`.
Home: `.env.example` (`NEXT_PUBLIC_WS_URL`), `lib/{auth,types,api,realtime}.ts`, `app/login/page.tsx`, `components/{Header,BlogCard,LikeButton,CommentSection,CommentForm}.tsx`, `app/blog/[slug]/page.tsx`.
