import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Movie } from '../types';
import { getMovies } from './movieService';
import { isPubliclyVisible } from './movieRow';

interface MovieContextValue {
  movies: Movie[];
  allMovies: Movie[];
  loading: boolean;
  refreshMovies: () => Promise<void>;
}

const MovieContext = createContext<MovieContextValue>({
  movies: [],
  allMovies: [],
  loading: true,
  refreshMovies: async () => {},
});

export function MovieProvider({ children }: { children: React.ReactNode }) {
  // Start empty and let consumers render skeletons while the catalog loads.
  // Never seed with the local mock catalog: painting its covers first and then
  // swapping in Supabase data is exactly the "stale image flash" bug.
  // getMovies() itself falls back to local data if Supabase is unreachable,
  // so state still resolves exactly once on error.
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const movies = useMemo(
    () => allMovies.filter(isPubliclyVisible),
    [allMovies],
  );

  const refreshMovies = useCallback(async () => {
    try {
      const data = await getMovies();
      if (mounted.current) setAllMovies(data);
    } catch {
      // keep whatever is already in state
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    refreshMovies().finally(() => {
      if (mounted.current) setLoading(false);
    });
    return () => {
      mounted.current = false;
    };
  }, [refreshMovies]);

  return (
    <MovieContext.Provider value={{ movies, allMovies, loading, refreshMovies }}>
      {children}
    </MovieContext.Provider>
  );
}

export function useMovies(): MovieContextValue {
  return useContext(MovieContext);
}
