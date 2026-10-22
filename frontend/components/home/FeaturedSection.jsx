"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import TrailerModal from '../movie/TrailerModal';
import BookingFlow, { prefetchCities } from '@/components/booking/BookingFlow';

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

// Dùng biến màu của theme thay cho màu cố định để tự đổi theo chế độ sáng/tối
const META_CHIP =
  'inline-flex items-center rounded-md border border-[var(--color-border-separator)] bg-[var(--color-fill-tertiary)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]';

const stagger = (ms) => ({ animationDelay: `${ms}ms`, animationFillMode: 'both' });

export default function FeaturedSection({
  movies = [],
  loading,
  onContinue, // nhận { showtime, seats, total, holdUntil, city, cinema } khi người dùng bấm Tiếp tục
}) {
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [fadeKey, setFadeKey] = useState(0); // Dùng để kích hoạt hiệu ứng fade

  // Bộ lọc và mã tìm kiếm truyền cho BookingFlow
  const [filters, setFilters] = useState(null);
  const [searchId, setSearchId] = useState(0);
  const [searching, setSearching] = useState(false);

  const activeMovie = movies[selectedMovieIndex] || movies[0];
  const activeTitle = activeMovie?.title || activeMovie?.name || '';

  // Kích hoạt hiệu ứng mỗi khi phim được chọn thay đổi
  useEffect(() => {
    setFadeKey((prev) => prev + 1);
  }, [selectedMovieIndex]);

  // Bấm "Đặt vé ngay": mở menu đặt vé với phim đang hiển thị.
  // Tăng searchId để bấm lại cùng một phim vẫn mở lại bảng và tải lại dữ liệu.
  const handleBook = useCallback(() => {
    if (!activeTitle) return;
    setSearching(true);
    setFilters({ movieTitle: activeTitle });
    setSearchId((id) => id + 1);
  }, [activeTitle]);

  const handleSearchSettled = useCallback(() => setSearching(false), []);

  // Mọi hook đã được gọi ở trên, từ đây mới được phép return sớm
  if (loading || !activeMovie) {
    return (
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-80 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-fill-tertiary)]" />
      </section>
    );
  }

  const activeDescription = activeMovie?.description || activeMovie?.overview || activeMovie?.synopsis || '';
  const activePoster = activeMovie?.posterUrl || activeMovie?.poster_url || activeMovie?.bannerUrl || activeMovie?.backdropUrl || '';
  const activeAgeRating = activeMovie?.ageRating || activeMovie?.ageRestriction;
  const activeDuration = activeMovie?.duration || activeMovie?.durationMinutes;

  return (
    <>
      <section
        className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10"
        style={{ fontFamily: FONT_STACK }}
      >
        <h2 className="mb-6 text-xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-2xl lg:mb-8">
          Phim nổi bật
        </h2>

        <div className="grid grid-cols-1 items-center gap-10 pb-10 lg:grid-cols-12 lg:gap-12 lg:pb-14">

          {/* Cột trái: Thông tin phim có hiệu ứng mờ dần */}
          <div className="order-2 flex flex-col items-start lg:order-1 lg:col-span-7">
            <div
              key={fadeKey}
              className="w-full"
            >
              <h1 style={stagger(0)} className="animate-fade-in text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--color-text-primary)]">
                {activeTitle}
              </h1>

              {activeDescription && (
                <p style={stagger(80)} className="animate-fade-in mt-5 line-clamp-4 max-w-[38rem] text-lg leading-relaxed text-[var(--color-text-secondary)] sm:text-[18px]">
                  {activeDescription}
                </p>
              )}

              <div style={stagger(160)} className="animate-fade-in mt-6 flex flex-wrap items-center gap-3">
                {activeMovie.genres && activeMovie.genres.length > 0 && (
                  <span className={META_CHIP}>{activeMovie.genres.join(', ')}</span>
                )}
                {activeAgeRating && (
                  <span className={META_CHIP}>{activeAgeRating}</span>
                )}
                {activeDuration && (
                  <span className={META_CHIP}>{activeDuration} phút</span>
                )}
              </div>

              <div style={stagger(240)} className="animate-fade-in mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleBook}
                  onPointerEnter={() => prefetchCities(activeTitle)}
                  onFocus={() => prefetchCities(activeTitle)}
                  disabled={searching}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-brand-primary)] px-8 text-sm font-bold text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)] transition-colors hover:bg-[var(--color-brand-primary-hover)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]"
                >
                  <span>{searching ? 'Đang tải suất chiếu...' : 'Đặt vé ngay'}</span>
                  {!searching && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  )}
                </button>

                {activeMovie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(true)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--color-border-separator)] bg-[var(--color-bg-primary)] px-8 text-sm font-bold text-[var(--color-text-primary)] shadow-[var(--shadow-low)] transition-colors hover:bg-[var(--color-fill-tertiary)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-separator)]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]">
                      <PlayIconSmall />
                    </span>
                    <span>Xem trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Poster và thumbnail */}
          <div className="order-1 flex flex-col items-center lg:order-2 lg:col-span-5 lg:items-end">
            <div className="relative aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-fill-secondary)] shadow-[var(--shadow-high)] sm:max-w-[320px]">
              {activePoster && (
                <Image
                  key={fadeKey}
                  src={activePoster}
                  alt={activeTitle}
                  fill
                  priority
                  sizes="(max-width: 640px) 280px, 320px"
                  className="object-cover transition-opacity duration-500 animate-fade-in"
                />
              )}
            </div>

            {movies.length > 1 && (
              <div className="mt-5 flex max-w-full items-center justify-center gap-2 overflow-x-auto p-1 scrollbar-none sm:max-w-[320px]">
                {movies.slice(0, 5).map((movie, index) => {
                  const isSelected = index === selectedMovieIndex;
                  return (
                    <button
                      key={movie.id || index}
                      type="button"
                      onClick={() => setSelectedMovieIndex(index)}
                      aria-label={movie.title}
                      aria-pressed={isSelected}
                      className={`relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-[var(--radius-xs)] transition-all ${
                        isSelected
                          ? 'ring-2 ring-[var(--color-brand-primary)] ring-offset-2 ring-offset-[var(--color-bg-primary)]'
                          : 'opacity-60 hover:-translate-y-0.5 hover:opacity-100'
                      }`}
                    >
                      {(movie.posterUrl || movie.poster_url) && (
                        <Image
                          src={movie.posterUrl || movie.poster_url}
                          alt={movie.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu đặt vé: chọn thành phố, rạp, suất chiếu rồi chọn ghế, tự mở khi có filters */}
      <BookingFlow
        filters={filters}
        searchId={searchId}
        onSearchSettled={handleSearchSettled}
        onContinue={onContinue}
      />

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={activeMovie?.trailerUrl}
        title={activeTitle}
      />
    </>
  );
}

function PlayIconSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
}