import { supabase } from './supabase';
import type { Movie } from '../types';
import { movies as localMovies } from '../data/movies';

// ── Row ↔ Movie mapping ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMovie(row: Record<string, any>): Movie {
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
    trailerUrl: (row.trailer_url as string) || undefined,
    posterPrompt: (row.poster_prompt as string) || undefined,
  };
}

function movieToRow(movie: Movie, status = 'Approved'): Record<string, unknown> {
  return {
    id: movie.id,
    title: movie.title,
    subtitle: movie.subtitle ?? '',
    description: movie.description ?? '',
    genre: movie.genre ?? '',
    genres: movie.genres ?? [movie.genre],
    duration: movie.duration ?? '',
    creator_name: movie.creator ?? '',
    price: movie.price ?? 0,
    cover_url: movie.thumbnail?.startsWith('data:') ? null : (movie.thumbnail || null),
    trailer_url: movie.trailerUrl ?? null,
    badge: movie.badge ?? '',
    tools: movie.tools ?? [],
    rating: movie.rating ?? '',
    language: movie.language ?? '',
    tags: movie.tags ?? [],
    release_year: movie.releaseYear ?? null,
    views: movie.views ?? 0,
    trailer_views: movie.trailerViews ?? 0,
    featured: movie.featured ?? false,
    subscriber_discount_eligible: movie.subscriberDiscountEligible ?? false,
    poster_prompt: movie.posterPrompt ?? null,
    status,
    updated_at: new Date().toISOString(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch all movies from Supabase.
 * On first run (empty table) seeds from local catalog data.
 * Falls back to local data on network/DB error.
 */
export async function getMovies(): Promise<Movie[]> {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('id');

    if (error) {
      console.warn('[movieService] fetch error, using local data:', error.message);
      return localMovies;
    }

    if (!data || data.length === 0) {
      console.info('[movieService] table empty — seeding from local catalog…');
      await seedMovies();
      return localMovies;
    }

    return data.map(rowToMovie);
  } catch (err) {
    console.warn('[movieService] unexpected error, using local data:', err);
    return localMovies;
  }
}

/**
 * Fetch a single movie by numeric id.
 * Falls back to local catalog on error.
 */
export async function getMovieById(id: number): Promise<Movie | null> {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return localMovies.find((m) => m.id === id) ?? null;
    }
    return rowToMovie(data);
  } catch {
    return localMovies.find((m) => m.id === id) ?? null;
  }
}

/**
 * Upsert a movie record. Used by the admin dashboard when saving edits.
 * cover_url and trailer_url should already be public Storage URLs (not base64) at this point.
 */
export async function upsertMovie(movie: Movie, status = 'Approved'): Promise<void> {
  const row = movieToRow(movie, status);
  const { error } = await supabase
    .from('movies')
    .upsert(row, { onConflict: 'id' });

  if (error) throw new Error(`Failed to save movie "${movie.title}": ${error.message}`);
}

/**
 * Seed the movies table from the local catalog (runs once when table is empty).
 */
async function seedMovies(): Promise<void> {
  const rows = localMovies.map((m) => movieToRow(m));
  const { error } = await supabase
    .from('movies')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
  if (error) console.warn('[movieService] seed error:', error.message);
}
