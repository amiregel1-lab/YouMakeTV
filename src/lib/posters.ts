import type { Movie } from '../types';

// Genre-tinted palette used for CSS fallback when the AI image hasn't loaded yet.
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

/**
 * Returns a Pollinations.ai URL that generates a real AI movie poster
 * from the movie's posterPrompt. Falls back to movie.thumbnail if no
 * prompt is available (e.g. CreatorFilm objects).
 */
export function getPosterUrl(
  movie: { id: number; thumbnail: string; posterPrompt?: string },
): string {
  if (movie.posterPrompt) {
    const prompt = encodeURIComponent(
      `${movie.posterPrompt} Photorealistic. No text overlays. Ultra-high quality.`,
    );
    return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=600&seed=${movie.id}&nologo=true&enhance=true`;
  }
  return movie.thumbnail;
}

/**
 * Returns the two gradient stop hex strings for a genre's fallback poster.
 */
export function getGenrePalette(genre: string): [string, string] {
  return GENRE_PALETTE[genre] ?? ['#0f172a', '#1e293b'];
}

/**
 * Inline style string for a genre-tinted gradient fallback poster background.
 * Use as: style={{ background: fallbackGradient(movie.genre) }}
 */
export function fallbackGradient(genre: string): string {
  const [from, to] = getGenrePalette(genre);
  return `linear-gradient(165deg, ${from} 0%, ${to} 55%, ${from} 100%)`;
}

// Re-export Movie so callers don't need a separate import just for the type.
export type { Movie };
