# Blog Feature
- add blog feature
# Backend
## Database
### Table
#### BLog
- title
- slug
- detail
- category
- draft (boolean true)
- cover(file.id)
- author(user.id)
## Requirement

### Admin
- admin can edit and delete blog

### User 
- user can CRUD their blog  

# Frontend
## component
### navigation
- blog
## route
### blog
- `/blog`
### blog view
- `/blog/slug/view` 
### blog edit
- `/blog/slug/edit` 
- admin can edit and delete blog
- user can edit and delete blog
- detail use rich text box
- avata use image drop box
