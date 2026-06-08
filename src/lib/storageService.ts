import { supabase } from './supabase';

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

/**
 * Upload a compressed poster base64 data URL to the `covers` bucket.
 * Uses signed upload URLs — works without a user session (anon key only).
 * Returns the public URL suitable for storing as cover_url in the movies table.
 */
export async function uploadCover(filmKey: string, dataUrl: string): Promise<string> {
  const { blob, mimeType } = dataUrlToBlob(dataUrl);
  const filename = `${filmKey}-${Date.now()}.${mimeToExt(mimeType)}`;

  const { data: signed, error: signErr } = await supabase.storage
    .from('covers')
    .createSignedUploadUrl(filename);

  if (signErr) throw new Error(`Failed to get signed upload URL: ${signErr.message}`);

  const { data, error } = await supabase.storage
    .from('covers')
    .uploadToSignedUrl(signed.path, signed.token, blob, { contentType: mimeType });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('covers')
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Upload a trailer video File to the `trailers` bucket.
 * Uses signed upload URLs — works without a user session (anon key only).
 * Returns the public URL suitable for storing as trailer_url in the movies table.
 */
export async function uploadTrailer(filmKey: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
  const filename = `${filmKey}-${Date.now()}.${ext}`;

  const { data: signed, error: signErr } = await supabase.storage
    .from('trailers')
    .createSignedUploadUrl(filename);

  if (signErr) throw new Error(`Failed to get signed upload URL: ${signErr.message}`);

  const { data, error } = await supabase.storage
    .from('trailers')
    .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });

  if (error) throw new Error(`Trailer upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('trailers')
    .getPublicUrl(data.path);

  return publicUrl;
}
