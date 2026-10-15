"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Lớp dùng chung, toàn bộ màu đi qua CSS variables nên tự đổi theo Light/Dark
const FIELD_LABEL =
  'mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]';

const FIELD_BUTTON =
  'flex h-11 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-fill-tertiary)] px-3.5 text-[13px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]';

const MENU_PANEL =
  'absolute left-0 top-full z-50 mt-1.5 w-full overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border-opaque-separator)] bg-[var(--color-bg-tertiary)] p-1.5 shadow-[var(--shadow-high)]';

// Bo góc lồng nhau: Radius_con = Radius_cha - Padding (14px - 6px = 8px)
const MENU_ITEM_BASE =
  'flex w-full items-center rounded-[calc(var(--radius-md)-6px)] px-3 py-2 text-left text-[13px] font-medium transition-colors';
const MENU_ITEM_IDLE =
  'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]';
const MENU_ITEM_ACTIVE =
  'bg-[var(--color-brand-primary)] font-semibold text-[var(--color-brand-on-primary)]';

export default function HeroSection({
  movies = [],
  movieTitles = [],
  onSelectShowtime,
}) {
  const [cities, setCities] = useState([]);
  // 'loading' | 'ready' | 'empty' | 'error'
  const [citiesStatus, setCitiesStatus] = useState('loading');
  const [selectedCity, setSelectedCity] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');

  const [showDate, setShowDate] = useState('');
  const [movieFilter, setMovieFilter] = useState('');

  const today = new Date();
  const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  // Chỉ một menu được mở tại một thời điểm: 'city' | 'cinema' | 'date' | 'movie' | null
  const [openMenu, setOpenMenu] = useState(null);
  const formRef = useRef(null);

  const displayMovieTitles =
    movieTitles.length > 0
      ? movieTitles
      : movies.map((m) => m.title || m.name).filter(Boolean);

  const toggleMenu = (name) => setOpenMenu((current) => (current === name ? null : name));

  const loadCities = useCallback(async () => {
    setCitiesStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/getCities`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCities(data);
        setSelectedCity((current) => current || data[0]);
        setCitiesStatus('ready');
      } else {
        setCities([]);
        setCitiesStatus('empty');
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách thành phố:', err);
      setCities([]);
      setCitiesStatus('error');
    }
  }, []);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  useEffect(() => {
    if (!selectedCity) return;
    let cancelled = false;
    async function fetchCinemasByCity() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/getCinemasByCity?city=${encodeURIComponent(selectedCity)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setCinemas(list);
        setSelectedCinema(list.length > 0 ? list[0].name : 'Tất cả rạp');
      } catch (err) {
        console.error('Lỗi khi tải danh sách rạp:', err);
        if (!cancelled) {
          setCinemas([]);
          setSelectedCinema('Tất cả rạp');
        }
      }
    }
    fetchCinemasByCity();
    return () => {
      cancelled = true;
    };
  }, [selectedCity]);

  // Đóng menu khi bấm ra ngoài form hoặc nhấn Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target)) setOpenMenu(null);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
    setOpenMenu(null);
  }
  function handleSelectToday() {
    const tYear = today.getFullYear();
    const tMonth = String(today.getMonth() + 1).padStart(2, '0');
    const tDay = String(today.getDate()).padStart(2, '0');
    setShowDate(`${tYear}-${tMonth}-${tDay}`);
    setCalendarViewDate(new Date());
    setOpenMenu(null);
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
    // z-30 để dropdown luôn nổi lên trên section phía dưới (nguyên nhân phổ biến gây che khuất)
    <section className="relative z-30 mx-auto max-w-[1200px] overflow-visible px-6">
      <form
        ref={formRef}
        onSubmit={handleFindShowtimes}
        className="relative grid items-end gap-3 overflow-visible rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 shadow-[var(--shadow-low)] sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
      >
        {/* 1. Khu vực */}
        <div className={`relative ${openMenu === 'city' ? 'z-50' : 'z-10'}`}>
          <label className={FIELD_LABEL}>Khu vực</label>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={openMenu === 'city'}
            onClick={() => toggleMenu('city')}
            className={FIELD_BUTTON}
          >
            <span className="truncate">{selectedCity || 'Chọn thành phố'}</span>
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform ${
                openMenu === 'city' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openMenu === 'city' && (
            <div role="listbox" className={`${MENU_PANEL} max-h-60`}>
              {citiesStatus === 'loading' && (
                <p className="px-3 py-2 text-center text-xs text-[var(--color-text-secondary)]">
                  Đang tải danh sách thành phố...
                </p>
              )}

              {citiesStatus === 'error' && (
                <div className="flex flex-col items-center gap-2 px-3 py-3 text-center">
                  <p className="text-xs text-[var(--color-system-error)]">
                    Không tải được danh sách thành phố. Kiểm tra backend đang chạy tại {API_BASE_URL}.
                  </p>
                  <button
                    type="button"
                    onClick={loadCities}
                    className="rounded-[var(--radius-xs)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)]"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {citiesStatus === 'empty' && (
                <p className="px-3 py-2 text-center text-xs text-[var(--color-text-secondary)]">
                  Chưa có thành phố nào có rạp chiếu.
                </p>
              )}

              {citiesStatus === 'ready' &&
                cities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="option"
                    aria-selected={selectedCity === c}
                    onClick={() => {
                      setSelectedCity(c);
                      setOpenMenu(null);
                    }}
                    className={`${MENU_ITEM_BASE} justify-between ${
                      selectedCity === c ? MENU_ITEM_ACTIVE : MENU_ITEM_IDLE
                    }`}
                  >
                    <span>{c}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* 2. Rạp chiếu */}
        <div className={`relative ${openMenu === 'cinema' ? 'z-50' : 'z-10'}`}>
          <label className={FIELD_LABEL}>Rạp chiếu</label>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={openMenu === 'cinema'}
            onClick={() => toggleMenu('cinema')}
            className={FIELD_BUTTON}
          >
            <span className="truncate">{selectedCinema || 'Chọn rạp chiếu'}</span>
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform ${
                openMenu === 'cinema' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openMenu === 'cinema' && (
            <div role="listbox" className={`${MENU_PANEL} max-h-60`}>
              {cinemas.length > 0 ? (
                cinemas.map((c) => (
                  <button
                    key={c.cinemaId || c.name}
                    type="button"
                    role="option"
                    aria-selected={selectedCinema === c.name}
                    onClick={() => {
                      setSelectedCinema(c.name);
                      setOpenMenu(null);
                    }}
                    className={`${MENU_ITEM_BASE} ${
                      selectedCinema === c.name ? MENU_ITEM_ACTIVE : MENU_ITEM_IDLE
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-center text-xs text-[var(--color-text-secondary)]">
                  {selectedCity ? `Không có rạp nào ở ${selectedCity}` : 'Hãy chọn thành phố trước'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 3. Ngày xem */}
        <div className={`relative ${openMenu === 'date' ? 'z-50' : 'z-10'}`}>
          <label className={FIELD_LABEL}>Ngày xem</label>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={openMenu === 'date'}
            onClick={() => toggleMenu('date')}
            className={FIELD_BUTTON}
          >
            <span className="truncate">{getFormattedDisplayDate()}</span>
            <IconCalendar className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
          </button>

          {openMenu === 'date' && (
            <div
              className={`${MENU_PANEL} !w-72 !rounded-[var(--radius-lg)] p-3`}
            >
              <div className="mb-2 flex items-center justify-between border-b border-[var(--color-border-separator)] pb-2">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Tháng {currentMonth + 1}, {currentYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Tháng trước"
                    onClick={handlePrevMonth}
                    className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)]"
                  >
                    <ChevronDownIcon className="h-4 w-4 rotate-90" />
                  </button>
                  <button
                    type="button"
                    aria-label="Tháng sau"
                    onClick={handleNextMonth}
                    className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)]"
                  >
                    <ChevronDownIcon className="h-4 w-4 -rotate-90" />
                  </button>
                </div>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((dayName) => (
                  <span
                    key={dayName}
                    className="text-[11px] font-semibold text-[var(--color-text-secondary)]"
                  >
                    {dayName}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarCells.map((cell, idx) => {
                  const cellDate = new Date(cell.year, cell.month, cell.day);
                  const isPast = cellDate < todayReset;
                  const isToday =
                    cell.year === today.getFullYear() &&
                    cell.month === today.getMonth() &&
                    cell.day === today.getDate();
                  const cellFormatted = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                  const isSelected = showDate === cellFormatted;

                  let stateClass;
                  if (isPast) {
                    stateClass = 'cursor-not-allowed text-[var(--color-text-quaternary)]';
                  } else if (isSelected) {
                    stateClass =
                      'bg-[var(--color-brand-primary)] font-bold text-[var(--color-brand-on-primary)]';
                  } else if (isToday) {
                    stateClass =
                      'border border-[var(--color-brand-primary)] font-bold text-[var(--color-brand-primary)]';
                  } else if (cell.isCurrentMonth) {
                    stateClass =
                      'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]';
                  } else {
                    stateClass =
                      'text-[var(--color-text-tertiary)] hover:bg-[var(--color-fill-tertiary)]';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-[var(--radius-xs)] text-xs font-medium transition-colors ${stateClass}`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border-separator)] pt-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={handleSelectToday}
                  className="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)]"
                >
                  Hôm nay
                </button>
                {showDate && (
                  <button
                    type="button"
                    onClick={() => setShowDate('')}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Phim */}
        <div className={`relative ${openMenu === 'movie' ? 'z-50' : 'z-10'}`}>
          <label className={FIELD_LABEL}>Phim (tuỳ chọn)</label>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={openMenu === 'movie'}
            onClick={() => toggleMenu('movie')}
            className={FIELD_BUTTON}
          >
            <span className="truncate">{movieFilter || 'Tất cả phim'}</span>
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform ${
                openMenu === 'movie' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openMenu === 'movie' && (
            <div role="listbox" className={`${MENU_PANEL} max-h-60`}>
              <button
                type="button"
                role="option"
                aria-selected={!movieFilter}
                onClick={() => {
                  setMovieFilter('');
                  setOpenMenu(null);
                }}
                className={`${MENU_ITEM_BASE} ${!movieFilter ? MENU_ITEM_ACTIVE : MENU_ITEM_IDLE}`}
              >
                Tất cả phim
              </button>
              {displayMovieTitles.map((title) => (
                <button
                  key={title}
                  type="button"
                  role="option"
                  aria-selected={movieFilter === title}
                  onClick={() => {
                    setMovieFilter(title);
                    setOpenMenu(null);
                  }}
                  className={`${MENU_ITEM_BASE} ${
                    movieFilter === title ? MENU_ITEM_ACTIVE : MENU_ITEM_IDLE
                  }`}
                >
                  <span className="truncate">{title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. Tìm suất chiếu */}
        <button
          type="submit"
          className="flex h-11 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] px-5 text-[13px] font-semibold text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 sm:col-span-2 sm:self-end lg:col-span-1"
        >
          <SearchIcon />
          <span>Tìm suất chiếu</span>
        </button>
      </form>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14M7 2v4M13 2v4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}