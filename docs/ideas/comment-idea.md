# comment Feature
- add comment feature
# Backend
- use websocket
## Database
### Table
#### comment
- userId(user.it)
- blogId(blog.id)
- content
- hidden(boolean default false)
#### like
- userId(user.id)
- blogId(blog.id)
- like:boolean

## Requirement
- admin can view edit delete comment
- user can crud comment
- admin cannot like

# admin
## component
### navigation
- comment

# home
- must login to like and comment

## page (`/blog/`)
- make count of like and count of comment
## page (`/blog/:slug`)
- make count of like and count of comment
- make like button
- make comment button
- make input comment to comment in bottom of blog