"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/movie/MovieCard';

const PAGE_SIZE = 10;

export default function NowShowingSection({ movies = [], genres = [], loading, onSelectShowtime }) {
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
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

  // Phim nổi bật hiện tại được chọn
  const activeMovie = filteredMovies[selectedMovieIndex] || filteredMovies[0] || movies[0];

  const visibleMovies = filteredMovies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMovies.length;

  // Lấy dữ liệu phim thực tế
  const activeTitle = activeMovie?.title || activeMovie?.name || '';
  const activeDescription = activeMovie?.description || activeMovie?.overview || activeMovie?.synopsis || '';
  const activePoster = activeMovie?.posterUrl || activeMovie?.poster_url || activeMovie?.bannerUrl || activeMovie?.backdropUrl || '/images/placeholder-movie.jpg';
  const activeAgeRating = activeMovie?.ageRating || activeMovie?.ageRestriction;
  const activeDuration = activeMovie?.duration || activeMovie?.durationMinutes;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      
      {/* KHỐI PHIM NỔI BẬT */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Phim nổi bật</h2>
      </div>

      {!loading && activeMovie && (
        <div className="overflow-hidden rounded-3xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 lg:p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Cột trái: Thông tin thực tế của Phim */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight">
                {activeTitle}
              </h1>

              {/* Thể loại & Thông tin cơ bản */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
                {activeMovie.genres && activeMovie.genres.length > 0 && (
                  <span>{activeMovie.genres.join(', ')}</span>
                )}
                {activeAgeRating && (
                  <span className="rounded-md border border-[var(--color-border-separator)] bg-[var(--color-fill-secondary)] px-2 py-0.5 font-semibold text-[var(--color-text-primary)]">
                    {activeAgeRating}
                  </span>
                )}
                {activeDuration && (
                  <span className="rounded-md border border-[var(--color-border-separator)] bg-[var(--color-fill-secondary)] px-2 py-0.5">
                    {activeDuration} phút
                  </span>
                )}
              </div>

              {/* Tóm tắt phim */}
              {activeDescription && (
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed max-w-xl">
                  {activeDescription}
                </p>
              )}

              {/* Nút Đặt vé & Xem Trailer */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onSelectShowtime && onSelectShowtime(activeMovie)}
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-[var(--color-brand-primary)] text-xs sm:text-sm font-semibold text-[var(--color-brand-on-primary)] shadow-sm transition-transform hover:scale-105 active:scale-95"
                >
                  <span>Đặt vé ngay</span>
                </button>

                {activeMovie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(activeMovie.trailerUrl, '_blank')}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-[var(--color-border-separator)] bg-[var(--color-fill-secondary)] text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)]"
                  >
                    <PlayIcon />
                    <span>Xem trailer</span>
                  </button>
                )}
              </div>

            </div>

            {/* Cột phải: Poster hiển thị đầy đủ tỉ lệ 2/3 */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[2/3] rounded-2xl overflow-hidden border border-[var(--color-border-separator)] shadow-md bg-[var(--color-fill-secondary)]">
                <img
                  src={activePoster}
                  alt={activeTitle}
                  className="h-full w-full object-contain bg-black/10"
                />
              </div>

              {/* Thumbnails chọn nhanh phim nổi bật */}
              {filteredMovies.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
                  {filteredMovies.slice(0, 5).map((movie, index) => {
                    const isSelected = index === selectedMovieIndex;
                    return (
                      <button
                        key={movie.id || index}
                        type="button"
                        onClick={() => setSelectedMovieIndex(index)}
                        className={`relative flex-shrink-0 h-14 w-10 rounded-md overflow-hidden border-2 transition-all ${
                          isSelected
                            ? 'border-[var(--color-brand-primary)] scale-105 shadow-sm'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={movie.posterUrl || movie.poster_url || '/images/placeholder-movie.jpg'}
                          alt={movie.title}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TIÊU ĐỀ PHIM ĐANG CHIẾU & BỘ LỌC THỂ LOẠI */}
      <div className="mt-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-4">
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

      <div className="rounded-2xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 shadow-sm">
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
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : visibleMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onSelectShowtime={onSelectShowtime} />
            ))}
      </div>

      {!loading && filteredMovies.length === 0 && (
        <div className="mt-8 text-center py-10 rounded-2xl border border-dashed border-[var(--color-border-separator)]">
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

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  );
}