import Image from 'next/image';
import Skeleton from '@/components/common/Skeleton';

export default function ComingSoonSection({ movies = [], loading }) {
  if (!loading && movies.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div>
        <h2 className="section-title">Phim sắp chiếu</h2>
        <p className="section-lede">Đánh dấu ngày khởi chiếu để không bỏ lỡ.</p>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`coming-soon-skeleton-${i}`} className="surface flex items-center gap-4 p-4">
                <Skeleton width={64} height={96} className="shrink-0 rounded-[10px]" />
                <div className="flex-1">
                  <Skeleton lines={2} widths={['78%', '46%']} />
                </div>
              </div>
            ))}
          </div>
        ) : (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie, index) => (
          <li
            key={movie.id ?? `coming-soon-${index}`}
            style={{ animationDelay: `${Math.min(index * 55, 330)}ms`, animationFillMode: 'both' }}
            className="animate-fade-in group surface flex items-center gap-4 p-4 transition-[transform,border-color] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[var(--color-border-opaque-separator)]"
          >
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-[10px] bg-[var(--color-fill-tertiary)]">
              {movie.posterUrl && (
                <Image
                  src={movie.posterUrl}
                  alt={`Poster phim ${movie.title}`}
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-105"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                {movie.title}
              </p>
              {movie.releaseDate && (
                <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                  Khởi chiếu {formatDate(movie.releaseDate)}
                </p>
              )}
              <span
                className="mt-3 inline-flex h-6 items-center rounded-full bg-[var(--color-brand-primary-container)] px-2.5 text-[11px] font-semibold text-[var(--color-brand-on-primary-container)]"
              >
                Sắp chiếu
              </span>
            </div>
          </li>
        ))}
      </ul>
        )}
      </div>
    </section>
  );
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
