// movies: [{ id, title, posterUrl, releaseDate }]
export default function ComingSoonSection({ movies = [] }) {
  if (movies.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl border-t border-[var(--color-border-separator)] px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Phim sắp chiếu</h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Khám phá những bộ phim sắp ra mắt.</p>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie) => (
          <li
            key={movie.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-3"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-fill-tertiary)]">
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={`Poster phim ${movie.title}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{movie.title}</p>
              {movie.releaseDate && (
                <p className="text-xs text-[var(--color-text-tertiary)]">Khởi chiếu {formatDate(movie.releaseDate)}</p>
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
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}