"use client";

import { useCallback, useState } from 'react';
import HeroSection from './HeroSection';
// Import ShowtimeFlow thay vì BookingFlow
import ShowtimeFlow from '@/components/booking/ShowtimeFlow'; 

// Đặt file này cùng thư mục với HeroSection.jsx (bản HeroSection gốc, có ô Rạp chiếu).
// Trang nào đang dùng HeroSection thì dùng SearchBooking thay cho HeroSection.
export default function SearchBooking({ movies = [], movieTitles = [], onContinue }) {
  // Bộ lọc { city, cinema, movieTitle } từ Hero Section, null nghĩa là chưa tìm lần nào
  const [filters, setFilters] = useState(null);
  // Tăng sau mỗi lần bấm tìm để tìm lại cùng bộ lọc vẫn mở bảng và tải lại dữ liệu
  const [searchId, setSearchId] = useState(0);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback((searchData) => {
    console.log('SearchBooking nhận:', searchData);
    setSearching(true);
    setFilters(searchData);
    setSearchId((n) => n + 1);
  }, []);

  // ShowtimeFlow tải xong suất chiếu (thành công hay lỗi) thì nút Tìm hết trạng thái chờ
  const handleSettled = useCallback(() => setSearching(false), []);

  return (
    <>
      {/* Không truyền onSelectShowtime: Hero gọi cả onSearch và onSelectShowtime với cùng dữ liệu,
          truyền cả hai sẽ làm luồng bị mở và tải lại hai lần */}
      <HeroSection
        movies={movies}
        movieTitles={movieTitles}
        searching={searching}
        onSearch={handleSearch}
      />

      {/* Đổi BookingFlow thành ShowtimeFlow */}
      <ShowtimeFlow
        filters={filters}
        searchId={searchId}
        onSearchSettled={handleSettled}
        onContinue={onContinue}
      />
    </>
  );
}