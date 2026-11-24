"use client";

import { useCallback, useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import FeaturedSection from '@/components/home/FeaturedSection';
import MoviesSection from '@/components/home/MoviesSection';
import BookingFlow from '@/components/booking/BookingFlow';
import Footer from '@/components/layout/Footer';
import '@/styles/booking-motion.css';

import SearchBooking from '@/components/home/SearchBooking';

export default function HomePageClient({
  initialNowShowing = [],
  movieTitles = [],
  initialError = false,
}) {
  // Trang chủ chỉ cần trang phim đầu tiên (cho khối nổi bật và ô gợi ý tìm kiếm).
  // Danh sách phim đầy đủ do MoviesSection tự lấy theo trang.
  const nowShowing = initialNowShowing;

  // Luồng đặt vé dùng chung cho FeaturedSection và nút "Chọn suất" trên thẻ phim
  const [filters, setFilters] = useState(null);
  const [searchId, setSearchId] = useState(0);

  // Đặt vé nhanh xong quay về từ VNPay: dựng lại filters từ URL để BookingFlow
  // mở lại đúng modal xác nhận (trang chủ tải lại thì state filters bị mất).
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const movieTitle = params.get('movieTitle');

    if (!movieTitle) return;

    setFilters({
      movieTitle,
      city: params.get('city') || undefined,
      cinema: params.get('cinema') || undefined,
    });
    setSearchId((n) => n + 1);
  }, []);

  // Mở luồng đặt vé cho một phim (dành cho thẻ phim và FeaturedSection)
  const openBooking = useCallback((title) => {
    if (!title) return;
    setFilters({ movieTitle: title });
    setSearchId((n) => n + 1);
  }, []);

  // Nút "Chọn suất" trên thẻ phim
  const handleSelectShowtime = useCallback(
    (movie) => {
      openBooking(movie?.title || movie?.name);
    },
    [openBooking]
  );

  // Khi người dùng bấm Tiếp tục ở bước ghế, phần thanh toán sẽ nối vào đây
  const handleContinue = useCallback((payload) => {
    console.log('Chuyển sang thanh toán:', payload);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] selection:bg-[var(--color-brand-fill)] selection:text-[var(--color-brand-on-primary)] transition-colors duration-200 overflow-visible">
      <Header />

      <main className="overflow-visible pb-12">
        {initialError && (
          <div className="mx-auto pt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-system-error)]/40 bg-[var(--color-system-error)]/10 px-4 py-3 text-sm font-medium text-[var(--color-system-error)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[var(--color-system-error)]" />
              <p>Không thể tải danh sách phim đang chiếu.</p>
            </div>
          </div>
        )}

        {/* 1. KHỐI PHIM NỔI BẬT */}
        <FeaturedSection movies={nowShowing} onContinue={handleContinue} />

        {/* 2. THANH TÌM SUẤT CHIẾU NHANH: nổi lên trên mép dưới của hero */}
        <div className="relative z-20 -mt-10 sm:-mt-14">
          <SearchBooking
            movies={nowShowing}
            movieTitles={movieTitles}
            onContinue={handleContinue}
          />
        </div>

        {/* 3. KHỐI PHIM: tab Đang chiếu / Sắp chiếu */}
        <MoviesSection onSelectShowtime={handleSelectShowtime} />
      </main>

      {/* BookingFlow dùng chung cho MoviesSection và FeaturedSection */}
      <BookingFlow filters={filters} searchId={searchId} onContinue={handleContinue} />

      <Footer />
    </div>
  );
}
