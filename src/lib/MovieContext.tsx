import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Movie } from '../types';
import { getMovies } from './movieService';
import { movies as localMovies } from '../data/movies';

interface MovieContextValue {
  movies: Movie[];
  loading: boolean;
  refreshMovies: () => Promise<void>;
}

const MovieContext = createContext<MovieContextValue>({
  movies: localMovies,
  loading: false,
  refreshMovies: async () => {},
});

export function MovieProvider({ children }: { children: React.ReactNode }) {
  // Start with local catalog so the UI renders instantly, then swap in Supabase data.
  const [movies, setMovies] = useState<Movie[]>(localMovies);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const refreshMovies = useCallback(async () => {
    try {
      const data = await getMovies();
      if (mounted.current) setMovies(data);
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
    <MovieContext.Provider value={{ movies, loading, refreshMovies }}>
      {children}
    </MovieContext.Provider>
  );
}

export function useMovies(): MovieContextValue {
  return useContext(MovieContext);
}
