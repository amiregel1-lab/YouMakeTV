import type { Movie } from '../types';

// ── Row ↔ Movie mapping ───────────────────────────────────────────────────────
//
// Lives in its own module, free of any browser/Supabase-client import, so the
// build-time prerender script can `ssrLoadModule` it in Node and map the live
// PostgREST rows with exactly the same code the app uses. One mapper means the
// prerendered HTML cannot describe a film differently from the running app.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToMovie(row: Record<string, any>): Movie {
  return {
    id: row.id as number,
    title: row.title as string,
    subtitle: (row.subtitle as string) ?? '',
    description: (row.description as string) ?? '',
    genre: (row.genre as string) ?? '',
    genres: (row.genres as string[] | null) ?? [(row.genre as string) ?? ''],
    duration: (row.duration as string) ?? '',
    creator: (row.creator_name as string) ?? '',
    price: (row.price as number) ?? 0,
    thumbnail: (row.cover_url as string) || `https://picsum.photos/seed/ymtv${row.id}/400/600`,
    badge: (row.badge as string) ?? '',
    tools: (row.tools as string[] | null) ?? [],
    rating: (row.rating as string) ?? '',
    language: (row.language as string) ?? '',
    tags: (row.tags as string[] | null) ?? [],
    releaseYear: row.release_year as number | undefined,
    views: (row.views as number) ?? 0,
    trailerViews: (row.trailer_views as number) ?? 0,
    featured: (row.featured as boolean) ?? false,
    subscriberDiscountEligible: (row.subscriber_discount_eligible as boolean) ?? false,
    status: (row.status as string) ?? 'Approved',
    visible: (row.visible as boolean) ?? true,
    trailerUrl: (row.trailer_url as string) || undefined,
    backdropUrl: (row.backdrop_url as string) || undefined,
    posterPrompt: (row.poster_prompt as string) || undefined,
    updatedAt: (row.updated_at as string) || undefined,
    createdAt: (row.created_at as string) || undefined,
  };
}

/**
 * The single definition of "the public may see this film".
 *
 * Both defaults are deliberate: rows written before the columns existed carry
 * neither flag, and those are public. Shared with the prerender script so a
 * hidden or unapproved film can never leak into the published HTML or sitemap
 * while being correctly absent from the app.
 */
export function isPubliclyVisible(movie: Movie): boolean {
  return movie.visible !== false && (movie.status ?? 'Approved') === 'Approved';
}
