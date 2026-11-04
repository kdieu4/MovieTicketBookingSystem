"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MovieCard from '@/components/movie/MovieCard';
import { CheckIcon, IconFilter } from '@/components/common/Icons';
import Skeleton from '@/components/common/Skeleton';

const PAGE_SIZE = 10;

const TABS = [
  { id: 'showing', label: 'Đang chiếu' },
  { id: 'upcoming', label: 'Sắp chiếu' },
];

export default function MoviesSection({
  movies = [],
  comingSoon = [],
  loading,
  onSelectShowtime,
}) {
  const [tab, setTab] = useState('showing');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const isShowing = tab === 'showing';
  const isAllSelected = selectedGenres.length === 0;

  // Lấy thể loại từ chính danh sách đang chiếu: chip nào cũng có kết quả, kèm số phim.
  const genreOptions = useMemo(() => {
    const counts = new Map();
    for (const movie of movies) {
      for (const genre of movie.genres ?? []) {
        if (genre) counts.set(genre, (counts.get(genre) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi'))
      .map(([name, count]) => ({ name, count }));
  }, [movies]);

  function selectTab(id) {
    setTab(id);
    setSelectedGenres([]);
    setVisibleCount(PAGE_SIZE);
  }

  function handleSelectAll() {
    setSelectedGenres([]);
    setVisibleCount(PAGE_SIZE);
  }

  function handleToggleGenre(genreName) {
    setSelectedGenres((prev) => {
      if (prev.includes(genreName)) {
        return prev.filter((name) => name !== genreName);
      }
      return [...prev, genreName];
    });
    setVisibleCount(PAGE_SIZE);
  }

  const filteredMovies = useMemo(() => {
    if (isAllSelected) return movies;
    return movies.filter((movie) =>
      selectedGenres.some((genre) => movie.genres?.includes(genre))
    );
  }, [movies, selectedGenres, isAllSelected]);

  const visibleMovies = filteredMovies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMovies.length;

  return (
    <section id="phim" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div>
        <h2 className="section-title">Phim</h2>
        <p className="section-lede">Phim đang chiếu và sắp ra mắt tại Seenema.</p>
      </div>

      {/* Tab chuyển giữa phim đang chiếu và sắp chiếu */}
      <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Danh sách phim">
        {TABS.map(({ id, label }) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`phim-tab-${id}`}
              aria-selected={isActive}
              aria-controls={`phim-panel-${id}`}
              onClick={() => selectTab(id)}
              className={`h-9 rounded-full px-4 text-xs font-semibold transition-[background-color,color,border-color,transform] duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[var(--color-brand-fill)] text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]'
                  : 'border border-[var(--color-border-separator)] text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {isShowing ? (
        <div
          key="showing"
          id="phim-panel-showing"
          role="tabpanel"
          aria-labelledby="phim-tab-showing"
          className="animate-fade-in"
        >
          {/* Bộ lọc thể loại cho phim đang chiếu */}
          {genreOptions.length > 0 && (
            <div className="mt-7 border-t border-[var(--color-border-separator)] pt-4">
              <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <IconFilter className="h-4 w-4 shrink-0" />
                  <span id="now-showing-genre-label" className="text-xs font-semibold">
                    Lọc theo thể loại
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    aria-live="polite"
                    className="px-1 text-xs font-medium tabular-nums text-[var(--color-text-tertiary)]"
                  >
                    {loading ? 'Đang tải phim…' : `${filteredMovies.length} phim`}
                  </span>
                  {!isAllSelected && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="inline-flex h-11 items-center rounded-full px-3 text-xs font-semibold text-[var(--color-brand-primary)] transition-colors duration-200 hover:bg-[var(--color-fill-secondary)]"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>
              </div>

              <div
                role="group"
                aria-labelledby="now-showing-genre-label"
                className="mt-3 flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  onClick={handleSelectAll}
                  data-active={isAllSelected}
                  aria-pressed={isAllSelected}
                  className="chip"
                >
                  Tất cả
                  <span className="chip-count">{movies.length}</span>
                </button>

                {genreOptions.map(({ name, count }) => {
                  const isSelected = selectedGenres.includes(name);

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleToggleGenre(name)}
                      data-active={isSelected}
                      aria-pressed={isSelected}
                      className="chip"
                    >
                      {name}
                      <span className="chip-count">{count}</span>
                      {isSelected && <CheckIcon className="h-3 w-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
              : visibleMovies.map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={index}
                    onSelectShowtime={onSelectShowtime}
                  />
                ))}
          </div>

          {!loading && filteredMovies.length === 0 && (
            <div className="animate-fade-in mt-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-separator)] px-6 py-12 text-center">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {isAllSelected ? 'Hiện chưa có phim đang chiếu.' : 'Không có phim thuộc thể loại đã chọn.'}
              </p>
              {!isAllSelected && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="mt-3 inline-flex h-11 items-center px-2 text-xs font-semibold text-[var(--color-brand-primary)] hover:underline"
                >
                  Hiển thị lại tất cả phim
                </button>
              )}
            </div>
          )}

          {!loading && hasMore && (
            <div className="mt-10 flex justify-center">
              <button type="button" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className="btn btn-secondary">
                Xem thêm phim
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          key="upcoming"
          id="phim-panel-upcoming"
          role="tabpanel"
          aria-labelledby="phim-tab-upcoming"
          className="animate-fade-in mt-8"
        >
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
          ) : comingSoon.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-separator)] px-6 py-12 text-center">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Hiện chưa có phim sắp chiếu.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {comingSoon.map((movie, index) => (
                <li
                  key={movie.id ?? `coming-soon-${index}`}
                  style={{ animationDelay: `${Math.min(index * 55, 330)}ms`, animationFillMode: 'both' }}
                >
                  <Link
                    href={`/phim/${movie.id}`}
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
                      <span className="mt-3 inline-flex h-6 items-center rounded-full bg-[var(--color-brand-primary-container)] px-2.5 text-[11px] font-semibold text-[var(--color-brand-on-primary-container)]">
                        Sắp chiếu
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function CardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/3] w-full rounded-[18px]" />
      <Skeleton lines={2} widths={['78%', '46%']} className="mt-3" />
    </div>
  );
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
