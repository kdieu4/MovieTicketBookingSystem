"use client";

import Link from 'next/link';

export default function MovieCard({ movie, onSelectShowtime, index = 0 }) {
  const genreLine = movie.genres?.slice(0, 2).join(' · ');

  // Nút "Chọn suất" nằm trong vùng bao quanh bởi Link, nên phải chặn sự kiện để không chuyển trang
  function handleSelect(event) {
    event.preventDefault();
    event.stopPropagation();
    onSelectShowtime?.(movie);
  }

  return (
    <article
      style={{ animationDelay: `${(index % 10) * 40}ms`, animationFillMode: 'both' }}
      className="animate-fade-in group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] shadow-[var(--shadow-low)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-border-opaque-separator)] hover:shadow-[var(--shadow-medium)]">
      <Link href={`/phim/${movie.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-fill-tertiary)]">
          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={`Poster phim ${movie.title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5 p-3.5 pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)] line-clamp-2 leading-snug">
            {movie.title}
          </h3>
          {genreLine && <p className="text-xs text-[var(--color-text-secondary)]">{genreLine}</p>}
        </div>
      </Link>

      <div className="flex items-center justify-between px-3.5 pb-3.5">
        {movie.ageRestriction ? (
          <span className="rounded-[var(--radius-xs)] border border-[var(--color-border-opaque-separator)] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--color-text-secondary)]">
            {movie.ageRestriction}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleSelect}
          className="inline-flex h-7 items-center justify-center rounded-full bg-[var(--color-brand-primary)] px-3 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-primary-hover)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
        >
          Đặt vé
        </button>
      </div>
    </article>
  );
}