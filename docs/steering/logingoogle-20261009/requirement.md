# Requirement: logingoogle-20261009 (docs/ideas/logingoogle-idea.md)

## Idea
- The home login card gets a **Log in with Google** button.
- The first time a Google email logs in, it is saved as a `user` with a **random password**.

## Flow (Google Identity Services, ID token)
1. The home login page renders Google's sign-in button (script `accounts.google.com/gsi/client`, client id from `NEXT_PUBLIC_GOOGLE_CLIENT_ID`).
2. After the reader picks an account, Google returns a signed **ID token** (`credential`) to the browser.
3. Home sends it to `POST /api/auth/google` `{ "idToken": "..." }`.
4. Backend verifies the token with Google (signature, audience = `GOOGLE_CLIENT_ID`, expiry) and requires `email_verified = true`.
5. User lookup by email:
   - found -> log that user in;
   - not found -> create a user (role `user`) with that email, a generated unique username and a random password (64 hex chars, stored hashed, never shown), then log in.
6. Response is the same as the normal login: `{ "token": "<JWT>" }`. Home stores it exactly like a password login and follows the `next` redirect.

## Rules
- Only the `user` role can use Google login. An email that belongs to an admin is not matched against admins.
- An existing user with the same email (for example created by an admin) is **linked**: Google proves ownership of the email, so that user is logged in.
- Username is built from the email local part (letters, digits, `_`), padded/suffixed to be at least 6 characters and unique (`name`, `name2`, ...).
- Password login still works for users that have a real password; a Google-created user cannot password-login until an admin sets one.
- Invalid / expired / wrong-audience token, or unverified email: `401`. Google login not configured (no `GOOGLE_CLIENT_ID`): `503`.
- Avatar from the Google profile is **not** imported (avatars are files in this system).

## Configuration (needs a Google OAuth client)
- Create an OAuth client of type **Web application** in Google Cloud Console; add `http://localhost:3001` as an authorized JavaScript origin.
- `backend/.env`: `GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com`
- `home/.env.local`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same id>`
- Without the id the button is hidden and the endpoint answers 503.

## Out of scope
Google login in the admin panel, importing the Google avatar, unlinking accounts, other providers.
