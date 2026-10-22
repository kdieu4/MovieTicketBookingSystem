"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/movie/MovieCard';

const PAGE_SIZE = 10;

export default function NowShowingSection({ movies = [], genres = [], loading, onSelectShowtime }) {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const isAllSelected = selectedGenres.length === 0;

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
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* TIÊU ĐỀ PHIM ĐANG CHIẾU & BỘ LỌC THỂ LOẠI */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Phim đang chiếu</h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Trải nghiệm điện ảnh đỉnh cao với lịch chiếu linh hoạt tại rạp.
          </p>
        </div>
        <Link
          href="/phim"
          className="text-xs sm:text-sm font-semibold text-[var(--color-brand-primary)] transition-colors hover:underline"
        >
          Xem tất cả phim →
        </Link>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 shadow-[var(--shadow-low)]">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--color-border-separator)] text-xs font-semibold text-[var(--color-text-secondary)]">
          <span>Lọc theo thể loại phim:</span>
          {!isAllSelected && (
            <span className="text-[var(--color-brand-primary)] font-bold">
              Đã chọn {selectedGenres.length} thể loại
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TabButton active={isAllSelected} onClick={handleSelectAll}>
            Tất cả
          </TabButton>
          {genres.map((genre) => {
            const genreName = genre.name ?? genre;
            const isSelected = selectedGenres.includes(genreName);

            return (
              <TabButton
                key={genre.id ?? genreName}
                active={isSelected}
                showCheck={isSelected}
                onClick={() => handleToggleGenre(genreName)}
              >
                {genreName}
              </TabButton>
            );
          })}
        </div>
      </div>

      {/* DANH SÁCH LƯỚI PHIM */}
      <div key={selectedGenres.join('|')} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : visibleMovies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} onSelectShowtime={onSelectShowtime} />
            ))}
      </div>

      {!loading && filteredMovies.length === 0 && (
        <div className="animate-fade-in mt-8 text-center py-10 rounded-2xl border border-dashed border-[var(--color-border-separator)]">
          <p className="text-xs text-[var(--color-text-tertiary)]">Không tìm thấy phim nào thuộc các thể loại đã chọn.</p>
          <button
            type="button"
            onClick={handleSelectAll}
            className="mt-2 text-xs font-semibold text-[var(--color-brand-primary)] hover:underline"
          >
            Hiển thị lại tất cả phim
          </button>
        </div>
      )}

      {!loading && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="h-9 rounded-full border border-[var(--color-border-separator)] px-6 text-xs font-semibold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-fill-tertiary)] active:scale-95"
          >
            Xem thêm phim
          </button>
        </div>
      )}
    </section>
  );
}

function TabButton({ active, onClick, children, showCheck = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-7 rounded-full px-3.5 text-xs font-medium transition-all active:scale-95 ${
        active
          ? 'bg-[var(--color-brand-primary)] text-white font-semibold shadow-sm'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)] bg-[var(--color-fill-secondary)]'
      }`}
    >
      <span>{children}</span>
      {showCheck && (
        <svg className="h-3 w-3 stroke-current" viewBox="0 0 16 16" fill="none" strokeWidth="2.5" strokeLinecap="round">
          <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
        </svg>
      )}
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)]">
      <div className="aspect-[3/4] bg-[var(--color-fill-tertiary)]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded bg-[var(--color-fill-tertiary)]" />
        <div className="h-2.5 w-1/2 rounded bg-[var(--color-fill-tertiary)]" />
      </div>
    </div>
  );
}