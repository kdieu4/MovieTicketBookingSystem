"use client";

import { useEffect, useRef, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function HeroSection({
  movies = [],
  movieTitles = [],
  onSelectShowtime,
}) {
  // State quản lý Thành phố & Rạp chiếu từ API
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');

  const [showDate, setShowDate] = useState('');
  const [movieFilter, setMovieFilter] = useState('');

  const today = new Date();
  const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [cinemaMenuOpen, setCinemaMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [movieMenuOpen, setMovieMenuOpen] = useState(false);

  const cityRef = useRef(null);
  const cinemaRef = useRef(null);
  const dateRef = useRef(null);
  const movieRef = useRef(null);

  // Danh sách tên phim sử dụng cho dropdown
  const displayMovieTitles = movieTitles.length > 0 
    ? movieTitles 
    : movies.map((m) => m.title || m.name).filter(Boolean);

  // 1. Fetch danh sách Thành phố từ API /api/getCities
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch(`${API_BASE_URL}/getCities`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCities(data);
            setSelectedCity(data[0]);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách thành phố:', err);
      }
    }
    fetchCities();
  }, []);

  // 2. Fetch danh sách Rạp khi Thành phố thay đổi
  useEffect(() => {
    if (!selectedCity) return;
    async function fetchCinemasByCity() {
      try {
        const res = await fetch(`${API_BASE_URL}/getCinemasByCity?city=${encodeURIComponent(selectedCity)}`);
        if (res.ok) {
          const data = await res.json();
          setCinemas(data);
          if (Array.isArray(data) && data.length > 0) {
            setSelectedCinema(data[0].name);
          } else {
            setSelectedCinema('Tất cả rạp');
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách rạp:', err);
      }
    }
    fetchCinemasByCity();
  }, [selectedCity]);

  // Đóng menu khi click bên ngoài
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
    if (onSelectShowtime) {
      onSelectShowtime({
        city: selectedCity,
        cinema: selectedCinema,
        date: showDate,
        movieTitle: movieFilter,
      });
    }
  }

  // Lịch chọn ngày
  const currentYear = calendarViewDate.getFullYear();
  const currentMonth = calendarViewDate.getMonth();

  function handlePrevMonth() { setCalendarViewDate(new Date(currentYear, currentMonth - 1, 1)); }
  function handleNextMonth() { setCalendarViewDate(new Date(currentYear, currentMonth + 1, 1)); }
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

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* THANH TÌM SUẤT CHIẾU NỔI */}
      <div className="relative z-30 overflow-visible">
        <form
          onSubmit={handleFindShowtimes}
          className="grid gap-3 rounded-2xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end overflow-visible"
        >
          {/* 1. Chọn Thành phố */}
          <div className={`relative ${cityMenuOpen ? 'z-50' : 'z-10'}`} ref={cityRef}>
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
              className="mt-1 flex h-10 w-full items-center justify-between rounded-lg border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3 text-xs font-medium text-[var(--color-text-primary)] hover:border-[var(--color-brand-primary)] transition-colors"
            >
              <span className="truncate">{selectedCity || 'Chọn thành phố'}</span>
              <ChevronDownIcon className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform ${cityMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {cityMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[var(--color-border-opaque-separator)] bg-[var(--color-bg-tertiary)] p-1.5 shadow-2xl backdrop-blur-xl">
                {cities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCity(c);
                      setCityMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                      selectedCity === c
                        ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] font-semibold'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]'
                    }`}
                  >
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Chọn Rạp chiếu */}
          <div className={`relative ${cinemaMenuOpen ? 'z-50' : 'z-10'}`} ref={cinemaRef}>
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
              className="mt-1 flex h-10 w-full items-center justify-between rounded-lg border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3 text-xs font-medium text-[var(--color-text-primary)] hover:border-[var(--color-brand-primary)] transition-colors"
            >
              <span className="truncate">{selectedCinema || 'Chọn rạp chiếu'}</span>
              <ChevronDownIcon className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform ${cinemaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {cinemaMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[var(--color-border-opaque-separator)] bg-[var(--color-bg-tertiary)] p-1.5 shadow-2xl backdrop-blur-xl">
                {cinemas.length > 0 ? (
                  cinemas.map((c) => (
                    <button
                      key={c.cinemaId || c.name}
                      type="button"
                      onClick={() => {
                        setSelectedCinema(c.name);
                        setCinemaMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between truncate rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                        selectedCinema === c.name
                          ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] font-semibold'
                          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-[var(--color-text-tertiary)] text-center">
                    Không có rạp nào ở {selectedCity}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Chọn Ngày xem */}
          <div className={`relative ${dateMenuOpen ? 'z-50' : 'z-10'}`} ref={dateRef}>
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
              className="mt-1 flex h-10 w-full items-center justify-between rounded-lg border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3 text-xs font-medium text-[var(--color-text-primary)] hover:border-[var(--color-brand-primary)] transition-colors"
            >
              <span className="truncate">{getFormattedDisplayDate()}</span>
              <IconCalendar className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
            </button>

            {dateMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-[var(--color-border-opaque-separator)] bg-[var(--color-bg-tertiary)] p-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-border-separator)]">
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    Tháng {currentMonth + 1}, {currentYear}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={handlePrevMonth} className="p-1 text-xs hover:bg-[var(--color-fill-tertiary)] rounded">‹</button>
                    <button type="button" onClick={handleNextMonth} className="p-1 text-xs hover:bg-[var(--color-fill-tertiary)] rounded">›</button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {WEEKDAYS.map((dayName) => (
                    <span key={dayName} className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase">{dayName}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarCells.map((cell, idx) => {
                    const cellDate = new Date(cell.year, cell.month, cell.day);
                    const isPast = cellDate < todayReset;
                    const isToday = cell.year === today.getFullYear() && cell.month === today.getMonth() && cell.day === today.getDate();
                    const cellFormatted = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                    const isSelected = showDate === cellFormatted;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isPast}
                        onClick={() => !isPast && handleSelectDay(cell.year, cell.month, cell.day)}
                        className={`h-7 w-7 mx-auto flex items-center justify-center rounded text-xs font-medium ${
                          isPast
                            ? 'text-[var(--color-text-tertiary)] opacity-25 cursor-not-allowed pointer-events-none'
                            : isSelected
                            ? 'bg-[var(--color-brand-primary)] text-white font-bold'
                            : isToday
                            ? 'border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] font-bold'
                            : cell.isCurrentMonth
                            ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]'
                            : 'text-[var(--color-text-tertiary)] opacity-30'
                        }`}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--color-border-separator)] text-xs font-semibold">
                  <button type="button" onClick={handleSelectToday} className="text-[var(--color-brand-primary)] hover:underline">Hôm nay</button>
                  {showDate && <button type="button" onClick={() => setShowDate('')} className="text-[var(--color-text-secondary)]">Xóa</button>}
                </div>
              </div>
            )}
          </div>

          {/* 4. Chọn Phim */}
          <div className={`relative ${movieMenuOpen ? 'z-50' : 'z-10'}`} ref={movieRef}>
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
              className="mt-1 flex h-10 w-full items-center justify-between rounded-lg border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3 text-xs font-medium text-[var(--color-text-primary)] hover:border-[var(--color-brand-primary)] transition-colors"
            >
              <span className="truncate">{movieFilter || 'Tất cả phim'}</span>
              <ChevronDownIcon className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform ${movieMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {movieMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[var(--color-border-opaque-separator)] bg-[var(--color-bg-tertiary)] p-1.5 shadow-2xl backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMovieFilter('');
                    setMovieMenuOpen(false);
                  }}
                  className="flex w-full items-center px-3 py-2 text-xs font-medium hover:bg-[var(--color-fill-tertiary)] rounded-md"
                >
                  Tất cả phim
                </button>
                {displayMovieTitles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      setMovieFilter(title);
                      setMovieMenuOpen(false);
                    }}
                    className="flex w-full items-center truncate px-3 py-2 text-xs font-medium hover:bg-[var(--color-fill-tertiary)] rounded-md"
                  >
                    <span className="truncate">{title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Nút Tìm suất chiếu */}
          <button
            type="submit"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-5 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-primary-hover)] sm:col-span-2 lg:col-span-1 sm:self-end"
          >
            <SearchIcon />
            <span>Tìm suất chiếu</span>
          </button>
        </form>
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14M7 2v4M13 2v4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}