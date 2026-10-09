# Project
- Language: English
- A system for managing user info.

# Backend project
- A basic RESTful API
- Save under the `/backend` folder.

## Tech
- NODEJS
- EXPRESS
- TYPESCRIPT
- MYSQL

## DATABASE
- Connect to the database using variables from the .env file.
- Use ORM Prisma
### Table
#### admin
- username(more than or equal 6 character)
- password(more than or equal 6 character)
- email(valid)

#### user
- username(more than or equal 6 character)
- password(more than or equal 6 character)
- email(valid)
- avata(file.id)

#### file
- name
- detail
- userId(user.id)

## Folder structure
- Use the `controller` -> `services` -> `repository` structure
- use solid rule
- use design pattern

## Requirement
### Admin
- can login
- can CRUD admin
- can CRUD user
- can view / delete file

### User
- can login
- can upload/delete their file
- can edit myselt

### file
- can upload from API
- save in `/public/upload`
- use name to make url

