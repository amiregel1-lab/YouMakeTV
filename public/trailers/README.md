# Trailer Storage

Place MP4 trailer files here. Vite/Vercel serves this folder as static assets.

## Usage

1. Drop an MP4 file into this folder, e.g. `parallax-station.mp4`
2. In Super Admin → Edit Film → Trailer File URL, enter: `/trailers/parallax-station.mp4`
3. Click **Test Trailer** to confirm the file is found and plays
4. Save — the URL persists in localStorage and plays on every page

## Demo trailer

The film **Parallax Station** is pre-configured with `/trailers/parallax-station.mp4`.
Add a real MP4 file with that name to enable live playback in the demo.

## Production

In production, replace file paths with CDN or video-platform URLs:
- Cloudflare R2
- AWS S3 + CloudFront
- Supabase Storage
- Mux (for adaptive streaming)
