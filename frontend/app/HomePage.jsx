"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import MoviesSection from '@/components/home/MoviesSection';
import ShowtimeFlow from '@/components/booking/ShowtimeFlow';
import Footer from '@/components/layout/Footer';
import { fetchMovieTitles, fetchNowShowingMoviesPage } from '@/services/movieApi';
import '@/styles/booking-motion.css';

export default function HomePage() {
  // Danh sách phim do MoviesSection tự lấy theo trang; ở đây chỉ cần phim nổi bật
  // và danh sách tên phim cho ô gợi ý của thanh tìm kiếm.
  const [featured, setFeatured] = useState(null);
  const [movieTitles, setMovieTitles] = useState([]);
  const [error, setError] = useState(null);

  // Luồng tìm suất chiếu từ thanh HeroSection
  const [filters, setFilters] = useState(null);
  const [searchId, setSearchId] = useState(0);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchNowShowingMoviesPage({ page: 0, size: 1 })
      .then((result) => {
        if (!cancelled) setFeatured(result.items[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setError('Không thể tải danh sách phim đang chiếu.');
      });

    fetchMovieTitles()
      .then((titles) => {
        if (!cancelled) setMovieTitles(titles);
      })
      .catch(() => {
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Handler cũ cho NowShowingSection và nút chọn phim thông thường
  function handleSelectShowtime(movie) {
    // Logic của bạn
  }

  // Handler cho thanh tìm kiếm của HeroSection
  function handleSearchShowtimes(nextFilters) {
    console.log('HomePage nhận filters:', nextFilters);
    setFilters(nextFilters);
    setSearchId((n) => n + 1);
    setSearching(true);
  }

  const featuredMovie = featured
    ? {
        ...featured,
        trailerUrl: featured.trailerUrl ?? null,
        bookingUrl: `/phim/${featured.id}/suat-chieu`,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] selection:bg-[var(--color-brand-fill)] selection:text-[var(--color-brand-on-primary)] transition-colors duration-200">
      <Header />

      <main className="animate-fade-in flex-1 pb-8 space-y-6">
        {error && (
          <div className="mx-auto pt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-system-error)]/40 bg-[var(--color-system-error)]/10 px-4 py-3 text-sm font-medium text-[var(--color-system-error)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[var(--color-system-error)]" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* 1. Phần Phim: tab Đang chiếu / Sắp chiếu, mỗi tab lấy theo trang */}
        <MoviesSection onSelectShowtime={handleSelectShowtime} />

        {/* 2. Thanh tìm suất chiếu nhanh (HeroSection) nằm bên dưới */}
        <HeroSection
          movies={featured ? [featured] : []}
          featuredMovie={featuredMovie}
          movieTitles={movieTitles}
          onSearch={handleSearchShowtimes}
          onSelectShowtime={handleSelectShowtime}
          searching={searching}
        />

        {/* 2b. Suất chiếu và sơ đồ ghế mở ra ngay dưới thanh tìm kiếm */}
        <ShowtimeFlow
          filters={filters}
          searchId={searchId}
          onSearchSettled={() => setSearching(false)}
        />

      </main>

      <Footer />
    </div>
  );
}