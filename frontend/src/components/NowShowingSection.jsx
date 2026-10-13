import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

const PAGE_SIZE = 15;

export default function NowShowingSection({ movies = [], genres = [], loading, onSelectShowtime }) {
  const [activeGenre, setActiveGenre] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredMovies = useMemo(() => {
    if (!activeGenre) return movies;
    return movies.filter((movie) => movie.genres?.includes(activeGenre));
  }, [movies, activeGenre]);

  const visibleMovies = filteredMovies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMovies.length;

  function handleTabClick(genreName) {
    setActiveGenre(genreName);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Phim đang chiếu</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Chọn phim yêu thích và xem lịch chiếu gần bạn.
          </p>
        </div>
        <Link
          to="/phim"
          className="text-sm font-semibold text-[var(--color-brand-primary)] transition-colors hover:text-[var(--color-brand-primary-hover)]"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 p-1 rounded-full bg-[var(--color-fill-quaternary)] max-w-max">
        <TabButton active={activeGenre === null} onClick={() => handleTabClick(null)}>
          Tất cả
        </TabButton>
        {genres.map((genre) => (
          <TabButton key={genre.id ?? genre.name} active={activeGenre === genre.name} onClick={() => handleTabClick(genre.name)}>
            {genre.name}
          </TabButton>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : visibleMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onSelectShowtime={onSelectShowtime} />
            ))}
      </div>

      {!loading && filteredMovies.length === 0 && (
        <p className="mt-8 text-center text-sm text-[var(--color-text-tertiary)] py-8">Chưa có phim nào ở thể loại này.</p>
      )}

      {!loading && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="h-10 rounded-full border border-[var(--color-border-opaque-separator)] px-6 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          >
            Xem thêm
          </button>
        </div>
      )}
    </section>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 rounded-full px-4 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
        active
          ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]'
      }`}
    >
      {children}
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)]">
      <div className="aspect-[3/4] bg-[var(--color-fill-tertiary)]" />
      <div className="space-y-2 p-3.5">
        <div className="h-3.5 w-3/4 rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
        <div className="h-3 w-1/2 rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
      </div>
    </div>
  );
}