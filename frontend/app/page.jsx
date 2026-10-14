"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import FeaturedSection from '@/components/home/FeaturedSection';
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
      .catch(() => {});

    fetchComingSoonMovies()
      .then((data) => {
        if (!cancelled) setComingSoon(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingComingSoon(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelectShowtime(movie) {}

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)] transition-colors duration-200 overflow-visible">
      <Header />

      <main className="pb-8 space-y-6 overflow-visible">
        {error && (
          <div className="mx-auto pt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-system-error)]/40 bg-[var(--color-system-error)]/10 px-4 py-3 text-sm font-medium text-[var(--color-system-error)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[var(--color-system-error)]" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* 1. KHỐI PHIM NỔI BẬT */}
        <FeaturedSection
          movies={nowShowing}
          loading={loadingNowShowing}
          onSelectShowtime={handleSelectShowtime}
        />

        {/* 2. THANH TÌM SUẤT CHIẾU NHANH (HERO SECTION) */}
        <HeroSection
          movies={nowShowing}
          movieTitles={nowShowing.map((m) => m.title)}
          onSelectShowtime={handleSelectShowtime}
        />

        {/* 3. KHỐI PHIM ĐANG CHIẾU & BỘ LỌC */}
        <NowShowingSection
          movies={nowShowing}
          genres={genres}
          loading={loadingNowShowing}
          onSelectShowtime={handleSelectShowtime}
        />

        {/* 4. KHỐI PHIM SẮP CHIẾU */}
        <ComingSoonSection movies={comingSoon} loading={loadingComingSoon} />
      </main>

      <Footer />
    </div>
  );
}