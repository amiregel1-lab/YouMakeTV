import type { Movie } from '../types';

// Wide landscape picsum for hero fallback — different seed from poster so it's a different image.
function picsumBackdrop(id: number) {
  return `https://picsum.photos/seed/ymtvbg${id}/1920/1080`;
}

const GENRE_PALETTE: Record<string, [string, string]> = {
  'Sci-Fi':      ['#020d2e', '#061a4a'],
  'Drama':       ['#1a0e04', '#2e1a08'],
  'Horror':      ['#080000', '#180404'],
  'Action':      ['#100500', '#261000'],
  'Thriller':    ['#06080f', '#0e1224'],
  'Comedy':      ['#1a1400', '#2e2200'],
  'Fantasy':     ['#0e0520', '#1e0a40'],
  'Anime':       ['#120420', '#240840'],
  'Animation':   ['#03121e', '#062438'],
  'Mystery':     ['#070710', '#10101e'],
  'Documentary': ['#091108', '#122212'],
};

// Appends a content-version token to a Storage/CDN URL so that re-uploading a
// new image to the SAME path produces a NEW URL. Without this, the browser/CDN
// keeps serving the previously cached bytes — which is why an updated cover
// flashes the *old* image for a second before revalidating to the new one.
// picsum and data: URLs are returned untouched (deterministic / inline already).
function withVersion(url: string, updatedAt?: string): string {
  if (!updatedAt || url.startsWith('data:')) return url;
  const v = Date.parse(updatedAt);
  if (Number.isNaN(v)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${v}`;
}

// Returns the poster URL for a movie.
// The movies table (cover_url) is the single source of truth — local caches of
// covers (e.g. the old youmake_media_overrides localStorage key) must never
// shadow it, or replaced covers keep flashing stale images per device.
export function getPosterUrl(
  movie: { id: number; thumbnail: string; title?: string; posterPrompt?: string; updatedAt?: string },
): string {
  if (movie.thumbnail && !movie.thumbnail.includes('picsum.photos')) {
    return withVersion(movie.thumbnail, movie.updatedAt);
  }
  return `https://picsum.photos/seed/ymtv${movie.id}/400/600`;
}

/**
 * Returns the wide 16:9 backdrop URL for a movie — used in the homepage hero.
 * Priority: backdropUrl set by admin → non-picsum thumbnail → 1920×1080 landscape picsum.
 * Falls back gracefully so any movie can be featured without a manual backdrop upload.
 */
export function getBackdropUrl(
  movie: { id: number; thumbnail: string; backdropUrl?: string; updatedAt?: string },
): string {
  if (movie.backdropUrl && !movie.backdropUrl.includes('picsum.photos')) {
    return withVersion(movie.backdropUrl, movie.updatedAt);
  }
  if (movie.thumbnail && !movie.thumbnail.includes('picsum.photos')) {
    return withVersion(movie.thumbnail, movie.updatedAt);
  }
  return picsumBackdrop(movie.id);
}

export function getGenrePalette(genre: string): [string, string] {
  return GENRE_PALETTE[genre] ?? ['#0f172a', '#1e293b'];
}

export function fallbackGradient(genre: string): string {
  const [from, to] = getGenrePalette(genre);
  return `linear-gradient(165deg, ${from} 0%, ${to} 55%, ${from} 100%)`;
}

export type { Movie };
