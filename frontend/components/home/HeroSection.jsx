"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import TrailerModal from '@/components/movie/TrailerModal';
import {
  IconPlay,
  SearchIcon,
  IconCalendar,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@/components/common/Icons';

const DEFAULT_CITIES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Nha Trang',
  'Thừa Thiên Huế',
  'Bình Dương',
];

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function HeroSection({
  featuredMovie,
  cinemas = [], // Danh sách rạp lấy từ bảng cinema (VD: [{ id, name, city, address }, ...])
  cities = DEFAULT_CITIES,
  movieTitles = [],
}) {
  // Trích xuất danh sách các Thành phố duy nhất từ bảng Cinema
  const cityList = useMemo(() => {
    if (cinemas && cinemas.length > 0) {
      const extractedCities = Array.from(
        new Set(cinemas.map((c) => c.city || c.location).filter(Boolean))
      );
      if (extractedCities.length > 0) return extractedCities;
    }
    return cities && cities.length > 0 ? cities : DEFAULT_CITIES;
  }, [cinemas, cities]);

  const [city, setCity] = useState(cityList[0] ?? 'Hà Nội');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [showDate, setShowDate] = useState('');
  const [movieFilter, setMovieFilter] = useState('');

  // Lọc danh sách Rạp chiếu theo Thành phố đã chọn
  const filteredCinemas = useMemo(() => {
    if (!cinemas || cinemas.length === 0) return [];
    return cinemas.filter((c) => (c.city || c.location) === city);
  }, [cinemas, city]);

  // Cập nhật Rạp mặc định khi đổi Thành phố
  useEffect(() => {
    if (filteredCinemas.length > 0) {
      setSelectedCinema(filteredCinemas[0].name || filteredCinemas[0].title);
    } else {
      setSelectedCinema('Tất cả rạp');
    }
  }, [city, filteredCinemas]);

  const today = new Date();
  const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [cinemaMenuOpen, setCinemaMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [movieMenuOpen, setMovieMenuOpen] = useState(false);

  const cityRef = useRef(null);
  const cinemaRef = useRef(null);
  const dateRef = useRef(null);
  const movieRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (cityRef.current && !cityRef.current.contains(event.target)) setCityMenuOpen(false);
      if (cinemaRef.current && !cinemaRef.current.contains(event.target)) setCinemaMenuOpen(false);
      if (dateRef.current && !dateRef.current.contains(event.target)) setDateMenuOpen(false);
      if (movieRef.current && !movieRef.current.contains(event.target)) setMovieMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleFindShowtimes(event) {
    event.preventDefault();
  }

  const currentYear = calendarViewDate.getFullYear();
  const currentMonth = calendarViewDate.getMonth();

  function handlePrevMonth() {
    setCalendarViewDate(new Date(currentYear, currentMonth - 1, 1));
  }

  function handleNextMonth() {
    setCalendarViewDate(new Date(currentYear, currentMonth + 1, 1));
  }

  function handleSelectDay(year, month, day) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    setShowDate(`${year}-${formattedMonth}-${formattedDay}`);
    setDateMenuOpen(false);
  }

  function handleSelectToday() {
    const tYear = today.getFullYear();
    const tMonth = String(today.getMonth() + 1).padStart(2, '0');
    const tDay = String(today.getDate()).padStart(2, '0');
    setShowDate(`${tYear}-${tMonth}-${tDay}`);
    setCalendarViewDate(new Date());
    setDateMenuOpen(false);
  }

  function handleClearDate() {
    setShowDate('');
    setDateMenuOpen(false);
  }

  function getFormattedDisplayDate() {
    if (!showDate) return 'Chọn ngày xem';
    const [y, m, d] = showDate.split('-');
    return `${d}/${m}/${y}`;
  }

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    calendarCells.push({ day, month: prevMonth, year: prevYear, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, month: currentMonth, year: currentYear, isCurrentMonth: true });
  }
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    calendarCells.push({ day: i, month: nextMonth, year: nextYear, isCurrentMonth: false });
  }

  if (!featuredMovie) {
    return (
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-56 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-fill-tertiary)]" />
      </section>
    );
  }

  const metaLine = [
    featuredMovie.genres?.join(', '),
    featuredMovie.durationMinutes ? `${featuredMovie.durationMinutes} phút` : null,
    featuredMovie.ageRestriction,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] shadow-[var(--shadow-medium)]">
        <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-brand-primary)] via-[var(--color-brand-primary-hover)] to-[var(--color-bg-tertiary)] pointer-events-none">
          <CitySkylineArt />
        </div>

        <div className="relative z-10 grid gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-[var(--color-brand-on-primary)]/15 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-brand-on-primary)] backdrop-blur-md">
              Phim nổi bật
            </span>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[var(--color-brand-on-primary)] sm:text-4xl">
              {featuredMovie.title}
            </h1>
            {metaLine && (
              <p className="mt-2.5 text-sm font-medium text-[var(--color-brand-on-primary)] opacity-90">{metaLine}</p>
            )}
            {featuredMovie.description && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-brand-on-primary)] opacity-80 line-clamp-3">
                {featuredMovie.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={featuredMovie.bookingUrl ?? '#'}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] px-6 text-sm font-semibold text-[var(--color-text-primary)] shadow-[var(--shadow-low)] transition-transform hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-on-primary)]"
              >
                Đặt vé ngay
              </a>
              {featuredMovie.trailerUrl && (
                <button
                  type="button"
                  onClick={() => setIsTrailerOpen(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-brand-on-primary)]/50 bg-[var(--color-brand-on-primary)]/10 px-6 text-sm font-semibold text-[var(--color-brand-on-primary)] backdrop-blur-md transition-all hover:bg-[var(--color-brand-on-primary)]/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-on-primary)]"
                >
                  <IconPlay />
                  Xem trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Đặt vé nhanh */}
        <form
          onSubmit={handleFindShowtimes}
          className="relative z-30 mx-4 mb-4 grid gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-translucent-card)] p-4 backdrop-blur-xl sm:mx-8 sm:mb-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end transition-all duration-300"
        >
          {/* 1. Thành phố */}
          <div className="relative" ref={cityRef}>
            <span className="block text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
              Khu vực
            </span>
            <button
              type="button"
              onClick={() => {
                setCityMenuOpen((v) => !v);
                setCinemaMenuOpen(false);
                setDateMenuOpen(false);
                setMovieMenuOpen(false);
              }}
              className="mt-1 flex h-10 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-opaque-separator)]"
            >
              <span className="truncate">{city}</span>
              <ChevronDownIcon className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${cityMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {cityMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 max-h-56 w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-1 shadow-[var(--shadow-high)] backdrop-blur-xl transition-all">
                {cityList.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      setCityMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-[var(--radius-xs)] px-3 py-2 text-left text-xs font-medium transition-colors ${
                      city === c
                        ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] font-semibold'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]'
                    }`}
                  >
                    <span>{c}</span>
                    {city === c && <CheckIcon />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Rạp chiếu (Dropdown hiển thị mượt mà theo Thành phố đã chọn) */}
          <div className="relative transition-all duration-300 ease-in-out opacity-100 transform translate-y-0" ref={cinemaRef}>
            <span className="block text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
              Rạp chiếu
            </span>
            <button
              type="button"
              onClick={() => {
                setCinemaMenuOpen((v) => !v);
                setCityMenuOpen(false);
                setDateMenuOpen(false);
                setMovieMenuOpen(false);
              }}
              className="mt-1 flex h-10 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-border-opaque-separator)]"
            >
              <span className="truncate">{selectedCinema}</span>
              <ChevronDownIcon className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${cinemaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {cinemaMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 max-h-56 w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-1 shadow-[var(--shadow-high)] backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-200">
                {filteredCinemas.length > 0 ? (
                  filteredCinemas.map((c) => {
                    const name = c.name || c.title;
                    return (
                      <button
                        key={c.id || name}
                        type="button"
                        onClick={() => {
                          setSelectedCinema(name);
                          setCinemaMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between truncate rounded-[var(--radius-xs)] px-3 py-2 text-left text-xs font-medium transition-colors ${
                          selectedCinema === name
                            ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] font-semibold'
                            : 'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]'
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        {selectedCinema === name && <CheckIcon />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-[var(--color-text-tertiary)] text-center">
                    Tất cả rạp ở {city}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Ngày xem */}
          <div className="relative" ref={dateRef}>
            <span className="block text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
              Ngày xem
            </span>
            <button
              type="button"
              onClick={() => {
                setDateMenuOpen((v) => !v);
                setCityMenuOpen(false);
                setCinemaMenuOpen(false);
                setMovieMenuOpen(false);
              }}
              className="mt-1 flex h-10 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-opaque-separator)]"
            >
              <span className="truncate">{getFormattedDisplayDate()}</span>
              <IconCalendar className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
            </button>

            {dateMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-3 shadow-[var(--shadow-high)] backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[var(--color-border-separator)]/60">
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    Tháng {currentMonth + 1}, {currentYear}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={handlePrevMonth} className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-tertiary)]">
                      <ChevronLeftIcon />
                    </button>
                    <button type="button" onClick={handleNextMonth} className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-tertiary)]">
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {WEEKDAYS.map((dayName) => (
                    <span key={dayName} className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase">
                      {dayName}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarCells.map((cell, idx) => {
                    const cellDate = new Date(cell.year, cell.month, cell.day);
                    const isPast = cellDate < todayReset; // Kiểm tra ngày đã qua
                    const isToday = cell.year === today.getFullYear() && cell.month === today.getMonth() && cell.day === today.getDate();
                    const cellFormatted = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                    const isSelected = showDate === cellFormatted;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isPast}
                        onClick={() => !isPast && handleSelectDay(cell.year, cell.month, cell.day)}
                        className={`h-8 w-8 mx-auto flex items-center justify-center rounded-[var(--radius-xs)] text-xs font-medium transition-all ${
                          isPast
                            ? 'text-[var(--color-text-tertiary)] opacity-25 cursor-not-allowed pointer-events-none'
                            : isSelected
                            ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] font-bold shadow-sm'
                            : isToday
                            ? 'border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] font-bold'
                            : cell.isCurrentMonth
                            ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]'
                            : 'text-[var(--color-text-tertiary)] opacity-40 hover:bg-[var(--color-fill-tertiary)]'
                        }`}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[var(--color-border-separator)]/60 text-xs font-semibold">
                  <button type="button" onClick={handleSelectToday} className="text-[var(--color-brand-primary)] hover:underline">
                    Hôm nay
                  </button>
                  {showDate && (
                    <button type="button" onClick={handleClearDate} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                      Xóa chọn
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Phim (tùy chọn) */}
          <div className="relative" ref={movieRef}>
            <span className="block text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
              Phim (tuỳ chọn)
            </span>
            <button
              type="button"
              onClick={() => {
                setMovieMenuOpen((v) => !v);
                setCityMenuOpen(false);
                setCinemaMenuOpen(false);
                setDateMenuOpen(false);
              }}
              className="mt-1 flex h-10 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-opaque-separator)]"
            >
              <span className="truncate">{movieFilter || 'Tất cả phim'}</span>
              <ChevronDownIcon className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${movieMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {movieMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 max-h-56 w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-1 shadow-[var(--shadow-high)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMovieFilter('');
                    setMovieMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[var(--radius-xs)] px-3 py-2 text-left text-xs font-medium transition-colors ${
                    !movieFilter
                      ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] font-semibold'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]'
                  }`}
                >
                  <span>Tất cả phim</span>
                  {!movieFilter && <CheckIcon />}
                </button>
                {movieTitles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      setMovieFilter(title);
                      setMovieMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between truncate rounded-[var(--radius-xs)] px-3 py-2 text-left text-xs font-medium transition-colors ${
                      movieFilter === title
                        ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] font-semibold'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]'
                    }`}
                  >
                    <span className="truncate">{title}</span>
                    {movieFilter === title && <CheckIcon />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Nút Đặt vé */}
          <button
            type="submit"
            className="flex h-10 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] px-5 text-sm font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-primary-hover)] sm:col-span-2 lg:col-span-1 sm:self-end"
          >
            <SearchIcon />
            <span>Tìm suất chiếu</span>
          </button>
        </form>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={featuredMovie.trailerUrl}
        title={featuredMovie.title}
      />
    </section>
  );
}

function CitySkylineArt() {
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-60 sm:block"
      viewBox="0 0 400 240"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
    >
      <circle cx="300" cy="70" r="70" fill="var(--color-brand-on-primary)" opacity="0.15" />
      <circle cx="300" cy="70" r="40" fill="var(--color-brand-on-primary)" opacity="0.25" />
      <g fill="rgba(0,0,0,0.25)">
        <rect x="150" y="140" width="24" height="100" />
        <rect x="190" y="110" width="20" height="130" />
        <rect x="225" y="160" width="18" height="80" />
        <rect x="255" y="90" width="22" height="150" />
        <rect x="290" y="150" width="20" height="90" />
        <rect x="325" y="120" width="24" height="120" />
        <rect x="360" y="170" width="18" height="70" />
      </g>
    </svg>
  );
}