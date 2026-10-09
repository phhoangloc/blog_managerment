# Product Requirements

Source: `docs/ideas/initital-idea.md`. Language: English.

## 1. Purpose
A system for managing user information. The first deliverable is a basic RESTful API (`/backend`) that lets administrators manage accounts and lets users manage their own profile and uploaded files.

## 2. Actors
| Actor | Description |
|---|---|
| Admin | Staff account. Manages other admins, users and every file. |
| User | End-user account. Manages only themselves and the files they own. |

Admins and users are separate tables; a login request states which role it is for.

## 3. Functional requirements

### 3.1 Admin
| ID | Requirement |
|---|---|
| A-1 | Can log in. |
| A-2 | Can create, read, update and delete admins. |
| A-3 | Can create, read, update and delete users. |
| A-4 | Can view and delete any file. |

### 3.2 User
| ID | Requirement |
|---|---|
| U-1 | Can log in. |
| U-2 | Can upload and delete their own files. |
| U-3 | Can edit themselves (username, email, password, avatar). |

### 3.3 File
| ID | Requirement |
|---|---|
| F-1 | A file can be uploaded through the API. |
| F-2 | Uploaded files are saved in `/public/upload`. |
| F-3 | The public URL of a file is built from its `name`. |

## 4. Data requirements
| Entity | Field | Rule |
|---|---|---|
| admin | username | at least 6 characters |
| admin | password | at least 6 characters (stored hashed) |
| admin | email | valid email |
| user | username | at least 6 characters |
| user | password | at least 6 characters (stored hashed) |
| user | email | valid email |
| user | avatar | optional reference to `file.id` (the idea writes "avata") |
| file | name | required, unique; letters, digits, `_` and `-` only (1-100 characters); used to build the URL |
| file | detail | optional free text (defaults to empty) |
| file | userId | owner, references `user.id` |

## 5. Non-functional requirements
- Stack: Node.js, Express, TypeScript, MySQL.
- ORM: Prisma. The database connection is configured only through variables in `.env`.
- Layering: controller -> service -> repository; follow SOLID and use design patterns where they fit.
- All errors are returned as JSON with an HTTP status and an `error` message.

## 6. Out of scope for the initial version
Password reset, email verification, user self-registration, file versioning, and any web front end. (Blogs, the admin panel and the public site were added later; see `docs/steering/`.)

## 7. Acceptance criteria
1. An admin and a user can each log in and receive a token.
2. An admin can CRUD admins and users, and view or delete any file.
3. A user can upload a file, delete it, and edit their own profile, but cannot touch another user's file.
4. A request with a username/password under 6 characters or an invalid email is rejected with 400.
5. An uploaded file is reachable at `/public/upload/<name>.<ext>`.
