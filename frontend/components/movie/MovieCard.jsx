"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function MovieCard({ movie, onSelectShowtime, index = 0 }) {
  const genreLine = movie.genres?.slice(0, 2).join(', ');
  const isUpcoming = movie.status === 'UPCOMING';

  // "Đặt vé" luôn là CTA chính (nền xanh) ở mọi trang; "Chi tiết" của phim sắp chiếu mới dùng nút viền.
  const actionBase = 'inline-flex h-8 shrink-0 items-center justify-center rounded-full px-3.5 text-xs font-semibold transition-[background-color,transform] duration-200 ease-[var(--ease-out)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]';
  const primaryAction = `${actionBase} bg-[var(--color-brand-fill)] text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-fill-hover)]`;

  // Nút "Đặt vé" nằm ngoài vùng Link, nên chỉ cần chặn sự kiện khi bấm.
  function handleSelect(event) {
    if (isUpcoming || !onSelectShowtime) return; // Để Link tự chuyển tới trang chi tiết
    event.preventDefault();
    event.stopPropagation();
    onSelectShowtime(movie);
  }

  return (
    <article
      style={{ animationDelay: `${(index % 10) * 35}ms`, animationFillMode: 'both' }}
      className="animate-fade-in group flex flex-col"
    >
      <Link
        href={`/phim/${movie.id}`}
        className="relative block aspect-[2/3] overflow-hidden rounded-[18px] bg-[var(--color-fill-tertiary)] ring-1 ring-[var(--color-border-separator)]"
      >
        {movie.posterUrl && (
          <Image
            src={movie.posterUrl}
            alt={`Poster phim ${movie.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.045]"
          />
        )}

        {movie.ageRestriction && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold leading-none text-white backdrop-blur-md">
            {movie.ageRestriction}
          </span>
        )}

        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.45),transparent_38%)] opacity-0 transition-opacity duration-300 ease-[var(--ease-out)] group-hover:opacity-100" />
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/phim/${movie.id}`} className="block">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-[var(--color-text-primary)] transition-colors duration-200 group-hover:text-[var(--color-brand-primary)]">
              {movie.title}
            </h3>
          </Link>
          {genreLine && (
            <p className="mt-1 truncate text-xs text-[var(--color-text-secondary)]">{genreLine}</p>
          )}
        </div>

        {isUpcoming || !onSelectShowtime ? (
          <Link
            href={`/phim/${movie.id}`}
            className={
              isUpcoming
                ? `${actionBase} border border-[var(--color-border-separator)] text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]`
                : primaryAction
            }
          >
            {isUpcoming ? 'Chi tiết' : 'Đặt vé'}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleSelect}
            className={primaryAction}
          >
            Đặt vé
          </button>
        )}
      </div>
    </article>
  );
}
