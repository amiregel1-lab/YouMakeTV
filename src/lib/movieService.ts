import { supabase } from './supabase';
import type { Movie } from '../types';
// One mapper for the whole codebase — the prerender script loads it too.
import { rowToMovie } from './movieRow';
import { movies as localMovies } from '../data/movies';
import { loadAdminSession } from './storage';

/**
 * The shape /api/admin/movies accepts — camelCase field names, allowlisted
 * server-side. Undefined entries are stripped so a field the console does not
 * know about is left alone rather than nulled.
 */
function movieToPatch(movie: Movie, status = 'Approved'): Record<string, unknown> {
  const cover = movie.thumbnail?.startsWith('data:') ? null : (movie.thumbnail || null);
  const backdrop = movie.backdropUrl?.startsWith('data:') ? null : (movie.backdropUrl ?? null);

  const patch: Record<string, unknown> = {
    title: movie.title,
    subtitle: movie.subtitle ?? '',
    description: movie.description ?? '',
    genre: movie.genre ?? '',
    genres: movie.genres ?? [movie.genre],
    duration: movie.duration ?? '',
    creatorName: movie.creator ?? '',
    price: movie.price ?? 0,
    coverUrl: cover,
    backdropUrl: backdrop,
    trailerUrl: movie.trailerUrl ?? null,
    badge: movie.badge ?? '',
    tools: movie.tools ?? [],
    rating: movie.rating ?? '',
    language: movie.language ?? '',
    tags: movie.tags ?? [],
    releaseYear: movie.releaseYear ?? null,
    featured: movie.featured ?? false,
    subscriberDiscountEligible: movie.subscriberDiscountEligible ?? false,
    posterPrompt: movie.posterPrompt ?? null,
    status,
  };

  for (const key of Object.keys(patch)) {
    if (patch[key] === undefined) delete patch[key];
  }
  return patch;
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
    backdrop_url: movie.backdropUrl?.startsWith('data:') ? null : (movie.backdropUrl ?? null),
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
 * Save one movie from the Super Admin console.
 *
 * This used to be a PostgREST upsert with the PUBLIC anon key. Migration 003
 * removed the anon key's INSERT/UPDATE on public.movies precisely because that
 * key is bundled into every visitor's browser — so the write either failed
 * silently or, worse, still worked for anyone who extracted the key. The save
 * now goes through /api/admin/movies, which writes server-side with the
 * service-role key behind a field allowlist, authenticated with the admin
 * session token this console already holds.
 *
 * cover_url and trailer_url must already be public Storage URLs (not base64):
 * the endpoint rejects data: URLs outright.
 */
export async function upsertMovie(movie: Movie, status = 'Approved'): Promise<void> {
  const session = loadAdminSession();
  if (!session?.token) {
    throw new Error('Your admin session has expired. Sign in again to save changes.');
  }

  const res = await fetch('/api/admin/movies', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': session.token,
    },
    body: JSON.stringify({ id: movie.id, patch: movieToPatch(movie, status) }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(`Failed to save movie "${movie.title}": ${data.error ?? `HTTP ${res.status}`}`);
  }
}

export async function patchMovie(id: number, patch: Record<string, unknown>): Promise<void> {
  const session = loadAdminSession();
  if (!session?.token) {
    throw new Error('Your admin session has expired. Sign in again to save changes.');
  }

  const res = await fetch('/api/admin/movies', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': session.token,
    },
    body: JSON.stringify({ id, patch }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(`Failed to update movie ${id}: ${data.error ?? `HTTP ${res.status}`}`);
  }
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
