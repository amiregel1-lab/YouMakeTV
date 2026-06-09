import { Movie } from '../types';

export interface Creator {
  name: string;
  films: Movie[];
  totalViews: number;
}

export type BadgeType = 'Top Studio' | 'Rising Studio' | 'Featured Studio' | 'New Studio';

export const BADGE_CONFIG: Record<BadgeType, { label: string; className: string }> = {
  'Top Studio':      { label: '★ Top Studio',    className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Rising Studio':   { label: '↑ Rising Studio', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  'Featured Studio': { label: '◆ Featured',      className: 'bg-violet-50 text-violet-700 border-violet-200' },
  'New Studio':      { label: '✦ New Studio',    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

// Deterministic very-dark tint per studio — subtle variety, all feel premium
const STUDIO_TINTS = [
  'bg-slate-900',
  'bg-indigo-950',
  'bg-violet-950',
  'bg-emerald-950',
  'bg-cyan-950',
  'bg-rose-950',
  'bg-amber-950',
  'bg-blue-950',
];

export function studioTint(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return STUDIO_TINTS[Math.abs(h) % STUDIO_TINTS.length];
}

export function getBadge(totalViews: number, films: Movie[]): BadgeType | null {
  if (totalViews > 80_000) return 'Top Studio';
  if (films.some((f) => f.featured)) return 'Featured Studio';
  if (totalViews > 30_000 && films.length >= 4) return 'Rising Studio';
  if (films.length <= 2) return 'New Studio';
  return null;
}

export function isVerified(totalViews: number, filmCount: number): boolean {
  return totalViews > 45_000 && filmCount >= 4;
}

export function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function topGenre(films: Movie[]): string {
  const counts: Record<string, number> = {};
  films.forEach((f) => { counts[f.genre] = (counts[f.genre] ?? 0) + 1; });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'Film';
}

export function joinYear(films: Movie[]): string {
  const year = Math.min(...films.map((f) => f.releaseYear ?? 2026));
  return isFinite(year) ? year.toString() : '2026';
}

export function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}
