"use client";

import { useState, useEffect } from 'react';
import TrailerModal from '../movie/TrailerModal';

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const META_CHIP =
  'inline-flex items-center rounded-md bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200';

export default function FeaturedSection({ movies = [], loading, onSelectShowtime }) {
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [fadeKey, setFadeKey] = useState(0); // Dùng để kích hoạt hiệu ứng fade

  const activeMovie = movies[selectedMovieIndex] || movies[0];

  // Kích hoạt hiệu ứng mỗi khi phim được chọn thay đổi
  useEffect(() => {
    setFadeKey(prev => prev + 1);
  }, [selectedMovieIndex]);

  if (loading || !activeMovie) {
    return (
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-80 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-fill-tertiary)]" />
      </section>
    );
  }

  const activeTitle = activeMovie?.title || activeMovie?.name || '';
  const activeDescription = activeMovie?.description || activeMovie?.overview || activeMovie?.synopsis || '';
  const activePoster = activeMovie?.posterUrl || activeMovie?.poster_url || activeMovie?.bannerUrl || activeMovie?.backdropUrl || '/images/placeholder-movie.jpg';
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
            {/* Vùng chứa bọc toàn bộ nội dung để áp dụng hiệu ứng chuyển đổi */}
            <div 
              key={fadeKey} 
              className="w-full transition-opacity duration-500 ease-in-out animate-fade-in"
            >
              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--color-text-primary)]">
                {activeTitle}
              </h1>

              {activeDescription && (
                <p className="mt-5 line-clamp-4 max-w-[38rem] text-lg leading-relaxed text-gray-500 sm:text-[18px]">
                  {activeDescription}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
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

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onSelectShowtime && onSelectShowtime(activeMovie)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0066FF] px-8 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <span>Đặt vé ngay</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>

                {activeMovie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(true)} // Mở modal thay vì tab mới
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-600 text-blue-600">
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
              <img
                key={fadeKey} // Thêm key để ảnh lớn cũng có hiệu ứng khi thay đổi
                src={activePoster}
                alt={activeTitle}
                className="h-full w-full object-cover transition-opacity duration-500 animate-fade-in"
              />
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
                          : 'opacity-60 hover:opacity-100'
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
      </section>

      {/* Tích hợp TrailerModal vào component */}
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