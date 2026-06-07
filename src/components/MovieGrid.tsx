import { Movie, ViewerAccount } from '../types';
import MovieCard from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  viewer?: ViewerAccount | null;
  onSelect: (movie: Movie) => void;
  onPurchase: () => void;
  compact?: boolean;
}

export default function MovieGrid({ movies, viewer, onSelect, onPurchase, compact = false }: MovieGridProps) {
  return (
    <div className={compact ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-2'}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} viewer={viewer} onSelect={onSelect} onPurchase={onPurchase} />
      ))}
    </div>
  );
}
