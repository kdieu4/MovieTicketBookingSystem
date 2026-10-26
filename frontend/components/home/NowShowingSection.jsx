"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/movie/MovieCard';
import { CheckIcon, IconFilter } from '@/components/common/Icons';
import Skeleton from '@/components/common/Skeleton';

const PAGE_SIZE = 10;

export default function NowShowingSection({ movies = [], loading, onSelectShowtime }) {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const isAllSelected = selectedGenres.length === 0;

  // Lấy thể loại từ chính danh sách phim: chip nào cũng có kết quả, kèm số phim.
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
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="section-title">Phim đang chiếu</h2>
          <p className="section-lede">Chọn phim, chọn suất chiếu và giữ ghế trong vài phút.</p>
        </div>
        <Link
          href="/phim"
          className="link-underline hidden shrink-0 text-sm font-medium sm:block"
        >
          Xem tất cả phim
        </Link>
      </div>

      {/* Bộ lọc thể loại: nhãn rõ ràng, chip xuống dòng, số phim và nút xóa lọc. */}
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

      {/* DANH SÁCH LƯỚI PHIM */}
      <div key={selectedGenres.join('|')} className="animate-fade-in mt-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
            : visibleMovies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} onSelectShowtime={onSelectShowtime} />
              ))}
        </div>
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
