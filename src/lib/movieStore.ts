import { movies } from '../data/movies';
import type { AdminFilm, Movie } from '../types';

const OVERRIDES_KEY = 'youmake_movie_overrides';
const ADMIN_FILMS_KEY = 'youmake_admin_films';

type MovieOverride = Partial<Omit<Movie, 'id'>>;
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
}

export function getMergedMovies(): Movie[] {
  const overrides = loadMovieOverrides();
  return movies.map((m) =>
    overrides[m.id] ? { ...m, ...overrides[m.id] } : m,
  );
}

export function getMovieById(id: number): Movie | undefined {
  const overrides = loadMovieOverrides();
  const base = movies.find((m) => m.id === id);
  if (!base) return undefined;
  return overrides[base.id] ? { ...base, ...overrides[base.id] } : base;
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

  const patch: MovieOverride = {
    title: adminFilm.title,
    subtitle: adminFilm.subtitle,
    description: adminFilm.description,
    genre: adminFilm.genre,
    duration: adminFilm.duration,
    price: adminFilm.price,
    thumbnail: adminFilm.thumbnail,
    rating: adminFilm.rating,
    releaseYear: adminFilm.releaseYear,
    featured: adminFilm.featured,
    ...(adminFilm.tags
      ? { tags: adminFilm.tags.split(',').map((t) => t.trim()).filter(Boolean) }
      : {}),
    // Only persist non-blob trailer URLs (blob URLs are session-scoped)
    ...(adminFilm.trailerUrl && !adminFilm.trailerUrl.startsWith('blob:')
      ? { trailerUrl: adminFilm.trailerUrl }
      : {}),
  };

  saveMovieOverride(movie.id, patch);
}
