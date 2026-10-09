# Structure: home
Backend: `repositories/interfaces.ts` + `prismaRepositories.ts` (`findAll` filter `draft`), `services/BlogService.ts` (`listPublished`, `getPublished`),
`controllers/BlogController.ts` (`listPublic`, `getPublic`), `routes/index.ts` (`/public/blogs`), tests `BlogService.test.ts`.
Home app (`/home`): `package.json`, `tsconfig.json`, `next.config.ts` (remote image host), `postcss.config.mjs`, `.env.example`, `.env.local`,
`src/app/{layout,globals.css,page,about/page,blog/[slug]/page,not-found}.tsx`,
`src/components/{Header,Footer,BlogCard,CoverImage,Prose,CopyLinkButton,ThemeToggle}.tsx`,
`src/lib/{api,types,format}.ts`.
