import { supabase } from './supabase';

function mimeToExt(mimeType: string): string {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  return 'jpg';
}

// Convert a base64 data URL to a Blob.
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
 * Returns the public URL suitable for storing as cover_url in the movies table.
 */
export async function uploadCover(filmKey: string, dataUrl: string): Promise<string> {
  const { blob, mimeType } = dataUrlToBlob(dataUrl);
  const filename = `${filmKey}-${Date.now()}.${mimeToExt(mimeType)}`;

  const { data, error } = await supabase.storage
    .from('covers')
    .upload(filename, blob, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('covers')
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Upload a trailer video File to the `trailers` bucket.
 * Returns the public URL suitable for storing as trailer_url in the movies table.
 */
export async function uploadTrailer(filmKey: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
  const filename = `${filmKey}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('trailers')
    .upload(filename, file, { contentType: file.type, upsert: true });

  if (error) throw new Error(`Trailer upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('trailers')
    .getPublicUrl(data.path);

  return publicUrl;
}
