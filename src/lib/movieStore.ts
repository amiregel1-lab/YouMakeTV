import { movies } from '../data/movies';
import type { AdminFilm, Movie } from '../types';

const OVERRIDES_KEY = 'youmake_movie_overrides';
const ADMIN_FILMS_KEY = 'youmake_admin_films';
// Thumbnails stored per-movie so a large base64 image never bloats the shared overrides JSON
const THUMB_PREFIX = 'youmake_thumb_';

type MovieOverride = Partial<Omit<Movie, 'id' | 'thumbnail'>>;
type OverridesMap = Record<number, MovieOverride>;

export function loadMovieOverrides(): OverridesMap {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as OverridesMap) : {};
  } catch {
    return {};
  }
}

export function saveMovieOverride(movieId: number, patch: MovieOverride) {
  try {
    const overrides = loadMovieOverrides();
    overrides[movieId] = { ...overrides[movieId], ...patch };
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {}
}

export function resetMovieOverride(movieId: number) {
  try {
    const overrides = loadMovieOverrides();
    delete overrides[movieId];
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {}
  // Also clear the per-movie thumbnail
  try { localStorage.removeItem(`${THUMB_PREFIX}${movieId}`); } catch {}
}

// Thumbnail stored separately so it never inflates the shared overrides JSON.
export function saveThumbnailOverride(movieId: number, dataUrl: string) {
  try {
    localStorage.setItem(`${THUMB_PREFIX}${movieId}`, dataUrl);
  } catch {}
}

export function loadThumbnailOverride(movieId: number): string | null {
  try {
    return localStorage.getItem(`${THUMB_PREFIX}${movieId}`);
  } catch {
    return null;
  }
}

export function getMergedMovies(): Movie[] {
  const overrides = loadMovieOverrides();
  return movies.map((m) => {
    const base = overrides[m.id] ? { ...m, ...overrides[m.id] } : m;
    const thumb = loadThumbnailOverride(m.id);
    return thumb ? { ...base, thumbnail: thumb } : base;
  });
}

export function getMovieById(id: number): Movie | undefined {
  const overrides = loadMovieOverrides();
  const base = movies.find((m) => m.id === id);
  if (!base) return undefined;
  const merged = overrides[base.id] ? { ...base, ...overrides[base.id] } : base;
  const thumb = loadThumbnailOverride(base.id);
  return thumb ? { ...merged, thumbnail: thumb } : merged;
}

export function saveAdminFilms(films: AdminFilm[]) {
  try {
    localStorage.setItem(ADMIN_FILMS_KEY, JSON.stringify(films));
  } catch {}
}

export function loadAdminFilms(): AdminFilm[] | null {
  try {
    const raw = localStorage.getItem(ADMIN_FILMS_KEY);
    return raw ? (JSON.parse(raw) as AdminFilm[]) : null;
  } catch {
    return null;
  }
}

// Map an AdminFilm's editable fields onto the public Movie store.
// Uses originalTitle to locate the movie (handles title renames).
export function applyAdminFilmToMovieStore(adminFilm: AdminFilm, originalTitle?: string) {
  const lookupTitle = (originalTitle ?? adminFilm.title).toLowerCase();
  const movie = movies.find((m) => m.title.toLowerCase() === lookupTitle);
  if (!movie) return; // admin-only film not in public catalog

  // Thumbnail stored per-movie (separate key) to avoid bloating the shared overrides JSON
  if (adminFilm.thumbnail) {
    saveThumbnailOverride(movie.id, adminFilm.thumbnail);
  }

  const patch: MovieOverride = {
    title: adminFilm.title,
    subtitle: adminFilm.subtitle,
    description: adminFilm.description,
    genre: adminFilm.genre,
    duration: adminFilm.duration,
    price: adminFilm.price,
    rating: adminFilm.rating,
    releaseYear: adminFilm.releaseYear,
    featured: adminFilm.featured,
    ...(adminFilm.tags
      ? { tags: adminFilm.tags.split(',').map((t) => t.trim()).filter(Boolean) }
      : {}),
    // Only persist non-blob external trailer URLs (file paths like /trailers/film.mp4)
    ...(adminFilm.trailerUrl && !adminFilm.trailerUrl.startsWith('blob:')
      ? { trailerUrl: adminFilm.trailerUrl }
      : {}),
  };

  saveMovieOverride(movie.id, patch);
}
