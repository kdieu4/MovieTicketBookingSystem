// movie: { id, title, posterUrl, genres, ageRestriction }
export default function MovieCard({ movie, onSelectShowtime }) {
  const genreLine = movie.genres?.slice(0, 2).join(' · ');

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] transition-colors hover:border-[var(--color-border-opaque-separator)]">
      <div className="aspect-[3/4] w-full bg-[var(--color-fill-tertiary)]">
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt={`Poster phim ${movie.title}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2">{movie.title}</h3>
        {genreLine && <p className="text-xs text-[var(--color-text-secondary)]">{genreLine}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          {movie.ageRestriction ? (
            <span className="rounded border border-[var(--color-border-opaque-separator)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
              {movie.ageRestriction}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => onSelectShowtime?.(movie)}
            className="rounded-full bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-medium text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          >
            Chọn suất
          </button>
        </div>
      </div>
    </article>
  );
}