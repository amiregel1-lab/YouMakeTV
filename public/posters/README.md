# /public/posters/

Place movie poster images here. Files committed to this folder are served
by Vercel CDN and are accessible on all devices (desktop, mobile, incognito).

## Naming convention

Use `poster-<movie-id>.jpg` where the ID matches the numeric `id` field in
`src/data/movies.ts`. Examples:

  poster-0.jpg   → Parallax Station (id: 0)
  poster-1.jpg   → The Quantum Fold (id: 1)

## Workflow

1. Open the Super Admin dashboard and edit a film.
2. Upload a cover image — it is compressed to 400×600 JPEG 75%.
3. Click "Download for deployment" to save the file.
4. Rename it to `poster-<id>.jpg` and place it here.
5. In the admin "Static poster path" field enter `/posters/poster-<id>.jpg`.
6. Click Save Changes.
7. Commit this file and deploy — the path now resolves universally.

While the path is stored in localStorage, mobile devices will only see the
poster once their localStorage contains the same override. After the file is
deployed and the path is set in the admin, any fresh page load on any device
will resolve the path from Vercel and display the correct image.
