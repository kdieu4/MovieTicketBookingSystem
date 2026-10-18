"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import NowShowingSection from '@/components/home/NowShowingSection';
import ComingSoonSection from '@/components/home/ComingSoonSection';
import ShowtimeFlow from '@/components/booking/ShowtimeFlow';
import Footer from '@/components/layout/Footer';
import { fetchNowShowingMovies, fetchComingSoonMovies, fetchGenres } from '@/services/movieApi';
import '@/styles/booking-motion.css';

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [genres, setGenres] = useState([]);

  const [loadingNowShowing, setLoadingNowShowing] = useState(true);
  const [loadingComingSoon, setLoadingComingSoon] = useState(true);
  const [error, setError] = useState(null);

  // Luồng tìm suất chiếu từ thanh HeroSection
  const [filters, setFilters] = useState(null);
  const [searchId, setSearchId] = useState(0);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchNowShowingMovies()
      .then((data) => {
        if (!cancelled) setNowShowing(data);
      })
      .catch(() => {
        if (!cancelled) setError('Không thể tải danh sách phim đang chiếu.');
      })
      .finally(() => {
        if (!cancelled) setLoadingNowShowing(false);
      });

    fetchGenres()
      .then((data) => {
        if (!cancelled) setGenres(data);
      })
      .catch(() => {
      });

    fetchComingSoonMovies()
      .then((data) => {
        if (!cancelled) setComingSoon(data);
      })
      .catch(() => {
      })
      .finally(() => {
        if (!cancelled) setLoadingComingSoon(false);
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

  const featuredMovie = nowShowing[0]
    ? {
        ...nowShowing[0],
        trailerUrl: nowShowing[0].trailerUrl ?? null,
        bookingUrl: `/phim/${nowShowing[0].id}/suat-chieu`,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)] transition-colors duration-200">
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

        {/* 1. Phần Phim đang chiếu / Phim nổi bật */}
        <NowShowingSection
          movies={nowShowing}
          genres={genres}
          loading={loadingNowShowing}
          onSelectShowtime={handleSelectShowtime}
        />

        {/* 2. Thanh tìm suất chiếu nhanh (HeroSection) nằm bên dưới */}
        <HeroSection
          movies={nowShowing}
          featuredMovie={featuredMovie}
          movieTitles={nowShowing.map((m) => m.title)}
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

        {/* 3. Phần Phim sắp chiếu */}
        <ComingSoonSection movies={comingSoon} loading={loadingComingSoon} />
      </main>

      <Footer />
    </div>
  );
}