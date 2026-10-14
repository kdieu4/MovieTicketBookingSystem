"use client";

import { useState } from 'react';

export default function FeaturedSection({ movies = [], loading, onSelectShowtime }) {
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);

  const activeMovie = movies[selectedMovieIndex] || movies[0];

  if (loading || !activeMovie) {
    return (
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-80 animate-pulse rounded-3xl bg-[var(--color-fill-tertiary)]" />
      </section>
    );
  }

  const activeTitle = activeMovie?.title || activeMovie?.name || '';
  const activeDescription = activeMovie?.description || activeMovie?.overview || activeMovie?.synopsis || '';
  const activePoster = activeMovie?.posterUrl || activeMovie?.poster_url || activeMovie?.bannerUrl || activeMovie?.backdropUrl || '/images/placeholder-movie.jpg';
  const activeAgeRating = activeMovie?.ageRating || activeMovie?.ageRestriction;
  const activeDuration = activeMovie?.duration || activeMovie?.durationMinutes;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Phim nổi bật</h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 lg:p-8 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Cột trái: Thông tin Phim */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight">
              {activeTitle}
            </h1>

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

            {activeDescription && (
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed max-w-xl">
                {activeDescription}
              </p>
            )}

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

          {/* Cột phải: Poster & Danh sách Thumbnail */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[2/3] rounded-2xl overflow-hidden border border-[var(--color-border-separator)] shadow-md bg-[var(--color-fill-secondary)]">
              <img
                src={activePoster}
                alt={activeTitle}
                className="h-full w-full object-contain bg-black/10"
              />
            </div>

            {movies.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
                {movies.slice(0, 5).map((movie, index) => {
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
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  );
}