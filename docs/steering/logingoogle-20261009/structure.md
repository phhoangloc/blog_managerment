# Structure: logingoogle-20261009
Backend: `package.json` (+`google-auth-library`), `config/env.ts` (`googleClientId`), `services/GoogleVerifier.ts` (interface `GoogleIdentityVerifier` + `GoogleAuthVerifier` using `OAuth2Client.verifyIdToken`),
`services/AuthService.ts` (`loginWithGoogle`, username generator, random password), `repositories` (reuse `IUserRepository`), `validators/schemas.ts` (`googleLoginSchema`),
`controllers/AuthController.ts` (`google`), `routes/index.ts` (`POST /auth/google`), `.env.example`, tests `AuthService.test.ts` (Google cases), validate test (schema).
Home: `.env.example` (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`), `components/GoogleButton.tsx` (loads GIS script, renders button, calls the API), `app/login/page.tsx` (button + "or" divider).
