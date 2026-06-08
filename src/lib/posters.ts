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

// Returns the poster URL for a movie.
// Prefers the thumbnail already on the movie object (set by getMergedMovies when an
// admin override exists). Falls back to legacy media-overrides store, then picsum.
export function getPosterUrl(
  movie: { id: number; thumbnail: string; title?: string; posterPrompt?: string },
): string {
  // Non-picsum thumbnails (e.g. base64 from admin upload) take priority
  if (movie.thumbnail && !movie.thumbnail.includes('picsum.photos')) {
    return movie.thumbnail;
  }
  // Legacy: check youmake_media_overrides (backward compat with sessions that used the old key)
  if (movie.title) {
    try {
      const raw = localStorage.getItem('youmake_media_overrides');
      if (raw) {
        const overrides = JSON.parse(raw) as Record<string, { thumbnail?: string }>;
        const t = overrides[movie.title]?.thumbnail;
        if (t) return t;
      }
    } catch {
      // ignore
    }
  }
  return `https://picsum.photos/seed/ymtv${movie.id}/400/600`;
}

/**
 * Returns the wide 16:9 backdrop URL for a movie — used in the homepage hero.
 * Priority: backdropUrl set by admin → non-picsum thumbnail → 1920×1080 landscape picsum.
 * Falls back gracefully so any movie can be featured without a manual backdrop upload.
 */
export function getBackdropUrl(
  movie: { id: number; thumbnail: string; backdropUrl?: string },
): string {
  if (movie.backdropUrl && !movie.backdropUrl.includes('picsum.photos')) {
    return movie.backdropUrl;
  }
  if (movie.thumbnail && !movie.thumbnail.includes('picsum.photos')) {
    return movie.thumbnail;
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
