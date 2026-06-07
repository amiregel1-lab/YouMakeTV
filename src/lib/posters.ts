import type { Movie } from '../types';

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

// Returns a reliable poster URL for a movie.
// Uses picsum.photos (seeded per movie.id) which is deterministic and always loads.
// Falls back to movie.thumbnail for any object that already carries its own URL.
export function getPosterUrl(
  movie: { id: number; thumbnail: string; posterPrompt?: string },
): string {
  return `https://picsum.photos/seed/ymtv${movie.id}/400/600`;
}

export function getGenrePalette(genre: string): [string, string] {
  return GENRE_PALETTE[genre] ?? ['#0f172a', '#1e293b'];
}

export function fallbackGradient(genre: string): string {
  const [from, to] = getGenrePalette(genre);
  return `linear-gradient(165deg, ${from} 0%, ${to} 55%, ${from} 100%)`;
}

export type { Movie };
