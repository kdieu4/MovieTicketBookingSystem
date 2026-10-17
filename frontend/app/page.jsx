"use client";

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import FeaturedSection from '@/components/home/FeaturedSection';
import HeroSection from '@/components/home/HeroSection';
import NowShowingSection from '@/components/home/NowShowingSection';
import ComingSoonSection from '@/components/home/ComingSoonSection';
import BookingFlow from '@/components/booking/BookingFlow';
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

  // Luồng đặt vé dùng chung cho FeaturedSection, HeroSection và nút "Chọn suất" trên thẻ phim
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

  // Mở luồng đặt vé cho một phim. Tăng searchId để bấm lại cùng phim vẫn tải lại dữ liệu.
  const openBooking = useCallback((title) => {
    if (!title) return;
    setSearching(true);
    setFilters({ movieTitle: title });
    setSearchId((n) => n + 1);
  }, []);

  const handleSearchSettled = useCallback(() => setSearching(false), []);

  // Nút "Chọn suất" trên thẻ phim
  const handleSelectShowtime = useCallback((movie) => {
    openBooking(movie?.title || movie?.name);
  }, [openBooking]);

  // Nhận bộ lọc từ HeroSection (chỉ cần tên phim, thành phố được chọn trong luồng)
  const handleSearchShowtimes = useCallback((nextFilters) => {
    openBooking(nextFilters?.movieTitle);
  }, [openBooking]);

  // Khi người dùng bấm Tiếp tục ở bước ghế, phần thanh toán sẽ nối vào đây
  const handleContinue = useCallback((payload) => {
    console.log('Chuyển sang thanh toán:', payload);
  }, []);

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
          onContinue={handleContinue}
        />

        {/* 2. THANH TÌM SUẤT CHIẾU NHANH (HERO SECTION) */}
        <HeroSection
          movies={nowShowing}
          movieTitles={nowShowing.map((m) => m.title)}
          onSearch={handleSearchShowtimes}
          onSelectShowtime={handleSelectShowtime}
          searching={searching}
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

      {/* BookingFlow là cửa sổ toàn màn hình (portal), đặt ở đây cho gọn */}
      <BookingFlow
        filters={filters}
        searchId={searchId}
        onSearchSettled={handleSearchSettled}
        onContinue={handleContinue}
      />

      <Footer />
    </div>
  );
}