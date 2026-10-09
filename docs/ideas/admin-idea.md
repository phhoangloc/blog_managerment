# admin project
- Save under the `/admin` folder.
- Connect to the backend project (default http://localhost:4000) using variables from the .env file.
- Decode `https://claude.ai/design/p/f99ce00f-30fe-49b7-8122-1a055a22f54b` and use its layout.
- must login to enter 

## TECH STACK
- NEXTJS
- TYPESCRIPT
- TAILWIND
## Requirement
- must be login to enter
## Components
### Navigation
- dashboard
- user(admin)
- file
### image_upload
- The image upload box supports both drag-and-drop and click.
### rich_text_box
- Use a rich text box when entering long text.
    - h1, h2, h3, h4, h5, B, I, U, URL,
    - image url
    - image upload (once uploaded, the image is displayed at the cursor position).
## Route
### user(`user`)
- admin can view
### user edit (`/user/:id/edit`)
- admin can edit and delete
### file(`/file`)
- `upload` button upload file
- show file in row
- if file is image show image, if file is file show icon
### file edit(`/file/:id/edit`)
- image upload box show image if file is image