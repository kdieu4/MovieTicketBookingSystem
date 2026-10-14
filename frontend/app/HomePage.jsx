"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import NowShowingSection from '@/components/home/NowShowingSection';
import ComingSoonSection from '@/components/home/ComingSoonSection';
import Footer from '@/components/layout/Footer';
import { fetchNowShowingMovies, fetchComingSoonMovies, fetchGenres } from '@/services/movieApi';

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [genres, setGenres] = useState([]);

  const [loadingNowShowing, setLoadingNowShowing] = useState(true);
  const [loadingComingSoon, setLoadingComingSoon] = useState(true);
  const [error, setError] = useState(null);

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

  function handleSelectShowtime(movie) {
  }

  const featuredMovie = nowShowing[0]
    ? {
        ...nowShowing[0],
        trailerUrl: nowShowing[0].trailerUrl ?? null,
        bookingUrl: `/phim/${nowShowing[0].id}/suat-chieu`,
      }
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)] transition-colors duration-200">
      <Header />

      <main className="pb-8 space-y-6">
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
          onSelectShowtime={handleSelectShowtime}
        />

        {/* 3. Phần Phim sắp chiếu */}
        <ComingSoonSection movies={comingSoon} loading={loadingComingSoon} />
      </main>

      <Footer />
    </div>
  );
}