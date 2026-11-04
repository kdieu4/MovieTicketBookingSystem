"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import TrailerModal from '../movie/TrailerModal';
import BookingFlow, { prefetchCities } from '@/components/booking/BookingFlow';

// Mỗi phần tử của hero vào lần lượt, tổng thời gian dưới 300ms để không bắt người dùng chờ.
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
      <section className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-[420px] animate-pulse rounded-[28px] bg-[var(--color-fill-tertiary)]" />
      </section>
    );
  }

  const activeDescription = activeMovie?.description || activeMovie?.overview || activeMovie?.synopsis || '';
  const activePoster = activeMovie?.posterUrl || activeMovie?.poster_url || activeMovie?.bannerUrl || activeMovie?.backdropUrl || '';
  const activeAgeRating = activeMovie?.ageRating || activeMovie?.ageRestriction;
  const activeDuration = activeMovie?.duration || activeMovie?.durationMinutes;

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-[var(--color-stage-bg)] sm:rounded-[36px]">
          {/* Ảnh poster phóng mờ làm nền sân khấu, gradient giữ chữ luôn đọc được */}
          <div aria-hidden="true" className="absolute inset-0">
            {activePoster && (
              <Image
                key={`bg-${fadeKey}`}
                src={activePoster}
                alt=""
                fill
                priority
                sizes="100vw"
                className="scale-110 object-cover opacity-35 blur-2xl saturate-125 animate-fade-in"
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(100deg,#07070a_6%,rgba(7,7,10,0.92)_44%,rgba(7,7,10,0.35)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_78%_18%,rgba(41,151,255,0.22),transparent_58%)]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,rgba(7,7,10,0.9),transparent)]" />
          </div>

          <div className="relative grid gap-8 px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12 lg:px-14 lg:pb-24 lg:pt-14">
            {/* Cột chữ */}
            <div key={fadeKey} className="order-2 lg:order-1">
              <div style={stagger(0)} className="animate-fade-in flex flex-wrap items-center gap-2">
                <span className="hero-badge">Đang chiếu</span>
                {activeAgeRating && <span className="hero-badge">{activeAgeRating}</span>}
                {activeDuration && <span className="hero-badge">{activeDuration} phút</span>}
              </div>

              <h1
                style={stagger(60)}
                className="animate-fade-in mt-5 max-w-[13ch] text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--color-stage-text)] text-balance"
              >
                {activeTitle}
              </h1>

              {activeDescription && (
                <p
                  style={stagger(120)}
                  className="animate-fade-in mt-5 line-clamp-3 max-w-[46ch] text-[15px] leading-relaxed text-[var(--color-stage-muted)] sm:text-base"
                >
                  {activeDescription}
                </p>
              )}

              {activeMovie.genres && activeMovie.genres.length > 0 && (
                <p style={stagger(180)} className="animate-fade-in mt-4 text-[13px] font-medium text-[var(--color-stage-muted)]">
                  {activeMovie.genres.join(', ')}
                </p>
              )}

              <div style={stagger(240)} className="animate-fade-in mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBook}
                  onPointerEnter={() => prefetchCities(activeTitle)}
                  onFocus={() => prefetchCities(activeTitle)}
                  disabled={searching}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-brand-fill)] px-7 text-sm font-semibold text-[var(--color-brand-on-primary)] transition-[background-color,transform] duration-200 ease-[var(--ease-out)] hover:bg-[var(--color-brand-fill-hover)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-stage-bg)]"
                >
                  <span>{searching ? 'Đang tải suất chiếu...' : 'Đặt vé ngay'}</span>
                  {!searching && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>

                {activeMovie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(true)}
                    className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[var(--color-stage-border)] bg-[var(--color-stage-fill)] px-6 text-sm font-semibold text-[var(--color-stage-text)] backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-[var(--ease-out)] hover:border-white/35 hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-stage-bg)]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current">
                      <PlayIconSmall />
                    </span>
                    <span>Xem trailer</span>
                  </button>
                )}
              </div>

              {/* Dải poster chọn phim: hiện trên mobile vì cột poster bị ẩn */}
              {movies.length > 1 && (
                <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
                  {movies.slice(0, 5).map((movie, index) => {
                    const isSelected = index === selectedMovieIndex;
                    const poster = movie.posterUrl || movie.poster_url;
                    return (
                      <button
                        key={movie.id || index}
                        type="button"
                        onClick={() => setSelectedMovieIndex(index)}
                        aria-label={movie.title}
                        aria-pressed={isSelected}
                        className={`relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-[8px] transition-[opacity,transform] duration-200 ease-[var(--ease-out)] ${
                          isSelected
                            ? 'ring-2 ring-[var(--color-brand-primary)] ring-offset-2 ring-offset-[var(--color-stage-bg)]'
                            : 'opacity-55 hover:opacity-100'
                        }`}
                      >
                        {poster && <Image src={poster} alt="" fill sizes="40px" className="object-cover" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cột poster: chỉ hiện từ desktop để trên mobile tiêu đề và nút nằm trong màn hình đầu */}
            <div className="order-1 hidden flex-col items-end gap-5 lg:order-2 lg:flex">
              <div className="relative aspect-[2/3] w-full max-w-[300px] overflow-hidden rounded-[22px] bg-white/5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
                {activePoster && (
                  <Image
                    key={`poster-${fadeKey}`}
                    src={activePoster}
                    alt={`Poster phim ${activeTitle}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 0px, 300px"
                    className="animate-fade-in object-cover"
                  />
                )}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/15" />
              </div>

              {movies.length > 1 && (
                <div className="flex max-w-[300px] items-center justify-end gap-2 overflow-x-auto p-1">
                  {movies.slice(0, 5).map((movie, index) => {
                    const isSelected = index === selectedMovieIndex;
                    const poster = movie.posterUrl || movie.poster_url;
                    return (
                      <button
                        key={movie.id || index}
                        type="button"
                        onClick={() => setSelectedMovieIndex(index)}
                        aria-label={movie.title}
                        aria-pressed={isSelected}
                        className={`relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-[8px] transition-[opacity,transform] duration-200 ease-[var(--ease-out)] ${
                          isSelected
                            ? 'ring-2 ring-[var(--color-brand-primary)] ring-offset-2 ring-offset-[var(--color-stage-bg)]'
                            : 'opacity-55 hover:-translate-y-0.5 hover:opacity-100'
                        }`}
                      >
                        {poster && <Image src={poster} alt="" fill sizes="40px" className="object-cover" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
