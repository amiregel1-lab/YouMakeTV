import type { Movie } from '../types';
import MovieCard from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  onSelect: (movie: Movie) => void;
  onWatchTrailer: () => void;
  compact?: boolean;
}

export default function MovieGrid({ movies, onSelect, onWatchTrailer, compact = false }: MovieGridProps) {
  return (
    <div className={compact ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelect} onWatchTrailer={onWatchTrailer} />
      ))}
    </div>
  );
}
