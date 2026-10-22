import Image from 'next/image';

export default function ComingSoonSection({ movies = [], loading }) {
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl border-t border-[var(--color-border-separator)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <div className="h-7 w-48 animate-pulse rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
          <div className="mt-1 h-4 w-72 animate-pulse rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`coming-soon-skeleton-${i}`}
              className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-3.5"
            >
              <div className="h-16 w-12 shrink-0 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-fill-tertiary)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
                <div className="h-3 w-1/2 animate-pulse rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl border-t border-[var(--color-border-separator)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Phim sắp chiếu</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Khám phá những tác phẩm điện ảnh sắp ra mắt tại rạp.</p>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie, index) => (
          <li
            key={movie.id ?? `coming-soon-${index}`}
            style={{ animationDelay: `${Math.min(index * 60, 420)}ms`, animationFillMode: 'both' }}
            className="animate-fade-in group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-3.5 shadow-[var(--shadow-low)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-opaque-separator)] hover:shadow-[var(--shadow-medium)]"
          >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-fill-tertiary)]">
              {movie.posterUrl && (
                <Image
                  src={movie.posterUrl}
                  alt={`Poster phim ${movie.title}`}
                  fill
                  sizes="48px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
                {movie.title}
              </p>
              {movie.releaseDate && (
                <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">
                  Khởi chiếu: {formatDate(movie.releaseDate)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}