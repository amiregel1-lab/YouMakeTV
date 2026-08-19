import { loadAdminSession } from './storage';

// Media uploads for the Super Admin console.
//
// These functions used to mint their own signed upload URLs with the PUBLIC
// anon key — the key bundled into every visitor's browser — which meant anyone
// who read it could upload arbitrary files into the public buckets (and
// migration 003's closing note says any anon INSERT policy on storage.objects
// should be dropped, which would have broken these uploads outright).
//
// The token is now minted by /api/admin/media with the service-role key,
// server-side, scoped to one path the server chooses, with the content type
// checked against a per-bucket allowlist. The bytes still travel straight from
// this browser to Supabase Storage — they never pass through Vercel — so a
// large trailer costs one upload, not three.

type Bucket = 'covers' | 'trailers';

interface MintedUpload {
  uploadUrl: string;
  publicUrl: string;
  contentType: string;
}

function mimeToExt(mimeType: string): string {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  return 'jpg';
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } {
  const [header, base64] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: mimeType }), mimeType };
}

/** Ask the server for a one-object, time-limited upload URL. */
async function mintUpload(bucket: Bucket, filename: string, contentType: string): Promise<MintedUpload> {
  const session = loadAdminSession();
  if (!session?.token) {
    throw new Error('Your admin session has expired. Sign in again to upload media.');
  }

  const res = await fetch('/api/admin/media', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': session.token,
    },
    body: JSON.stringify({ bucket, filename, contentType }),
  });

  const data = (await res.json().catch(() => ({}))) as Partial<MintedUpload> & { error?: string };
  if (!res.ok || !data.uploadUrl || !data.publicUrl) {
    throw new Error(data.error ?? `Could not start the upload (HTTP ${res.status}).`);
  }
  return { uploadUrl: data.uploadUrl, publicUrl: data.publicUrl, contentType: data.contentType ?? contentType };
}

/**
 * PUT the bytes to the signed URL. Multipart form body with the file under an
 * empty field name is what Supabase Storage expects from a signed upload URL —
 * the same request `uploadToSignedUrl` makes in the official client.
 */
async function putToSignedUrl(uploadUrl: string, body: Blob | File, label: string): Promise<void> {
  const form = new FormData();
  form.append('cacheControl', '3600');
  form.append('', body);

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'x-upsert': 'true' },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`${label} upload failed: ${detail.slice(0, 200) || `HTTP ${res.status}`}`);
  }
}

/**
 * Upload a compressed poster base64 data URL to the `covers` bucket.
 * Returns the public URL suitable for storing as cover_url in the movies table.
 */
export async function uploadCover(filmKey: string, dataUrl: string): Promise<string> {
  const { blob, mimeType } = dataUrlToBlob(dataUrl);
  const minted = await mintUpload('covers', `${filmKey}.${mimeToExt(mimeType)}`, mimeType);
  await putToSignedUrl(minted.uploadUrl, blob, 'Cover');
  return minted.publicUrl;
}

/**
 * Upload a backdrop/hero image base64 data URL to the `covers` bucket.
 * Returns the public URL for storing as backdrop_url.
 */
export async function uploadBackdrop(filmKey: string, dataUrl: string): Promise<string> {
  const { blob, mimeType } = dataUrlToBlob(dataUrl);
  const minted = await mintUpload('covers', `backdrop-${filmKey}.${mimeToExt(mimeType)}`, mimeType);
  await putToSignedUrl(minted.uploadUrl, blob, 'Backdrop');
  return minted.publicUrl;
}

/**
 * Upload a trailer video File to the `trailers` bucket.
 * Returns the public URL suitable for storing as trailer_url in the movies table.
 */
export async function uploadTrailer(filmKey: string, file: File): Promise<string> {
  const contentType = file.type || 'video/mp4';
  const minted = await mintUpload('trailers', `${filmKey}-${file.name}`, contentType);
  await putToSignedUrl(minted.uploadUrl, file, 'Trailer');
  return minted.publicUrl;
}
