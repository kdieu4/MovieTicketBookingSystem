"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';

// Giá trị rạp mặc định, khớp với ALL_CINEMAS trong BookingFlow
const ALL_CINEMAS = 'Tất cả rạp';

// Lớp dùng chung, toàn bộ màu đi qua CSS variables nên tự đổi theo Light/Dark
const FIELD_LABEL = 'field-label';

const FIELD_BUTTON =
  'flex h-12 w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-fill-tertiary)] px-3.5 text-[13px] font-medium text-[var(--color-text-primary)] transition-[background-color,border-color] duration-200 ease-[var(--ease-out)] hover:bg-[var(--color-fill-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]';

// Ô nhập tìm phim: cùng kích thước và màu với FIELD_BUTTON, thêm hiệu ứng viền khi focus
const FIELD_INPUT_WRAP =
  'group flex h-12 w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-fill-tertiary)] px-3.5 text-[var(--color-text-secondary)] transition-[background-color,border-color,box-shadow] duration-200 ease-[var(--ease-out)] hover:bg-[var(--color-fill-secondary)] focus-within:border-[var(--color-brand-primary)] focus-within:bg-[var(--color-bg-primary)] focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/25';

// bm-menu: hiệu ứng mở dropdown (định nghĩa trong booking-motion.css)
const MENU_PANEL =
  'bm-menu absolute left-0 top-full z-50 mt-1.5 w-full overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border-opaque-separator)] bg-[var(--color-bg-tertiary)] p-1.5 shadow-[var(--shadow-high)]';

// Bo góc lồng nhau: Radius_con = Radius_cha - Padding (14px - 6px = 8px)
const MENU_ITEM_BASE =
  'bm-item flex w-full items-center rounded-[calc(var(--radius-md)-6px)] px-3 py-2 text-left text-[13px] font-medium transition-colors';
const MENU_ITEM_IDLE =
  'text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)]';
const MENU_ITEM_ACTIVE =
  'bg-[var(--color-brand-fill)] font-semibold text-[var(--color-brand-on-primary)]';
// Mục đang được trỏ bằng bàn phím (mũi tên lên, xuống)
const MENU_ITEM_FOCUS =
  'bg-[var(--color-fill-secondary)] text-[var(--color-text-primary)]';

// Ba trường bắt buộc. Ngày xem được chọn ở bước sau, trong bảng suất chiếu của BookingFlow.
const REQUIRED_FIELDS = [
  { key: 'city', label: 'Khu vực' },
  { key: 'movie', label: 'Tên phim' },
  { key: 'cinema', label: 'Rạp chiếu' },
];

const itemDelay = (index) => ({ animationDelay: `${Math.min(index * 25, 250)}ms` });

// Bỏ dấu tiếng Việt từng ký tự một để vị trí chuỗi sau khi bỏ dấu khớp 1-1 với chuỗi gốc
// (cần cho việc tô sáng phần trùng khớp). Gõ "bo gia" vẫn tìm ra "Bố Già".
function foldChar(ch) {
  const folded = ch
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
  return folded.slice(0, 1) || ch;
}
function foldText(text) {
  let out = '';
  for (let i = 0; i < text.length; i += 1) out += foldChar(text[i]);
  return out;
}

// Mọi từ trong ô nhập đều phải xuất hiện trong tên phim (không cần đúng thứ tự)
function matchesQuery(title, query) {
  const tokens = foldText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = foldText(title);
  return tokens.every((t) => haystack.includes(t));
}

// Tô sáng đoạn trùng với nội dung đang gõ
function HighlightedTitle({ title, query, selected = false }) {
  const q = foldText(query.trim());
  const start = q ? foldText(title).indexOf(q) : -1;
  // Dòng đang được chọn có nền màu thương hiệu: không tô sáng nữa để chữ không trùng màu với nền
  if (start < 0 || selected) return <span className="truncate">{title}</span>;
  const end = start + q.length;
  return (
    <span className="truncate">
      {title.slice(0, start)}
      <span className="rounded-[2px] bg-[var(--color-brand-fill)]/20 text-[var(--color-brand-primary)]">
        {title.slice(start, end)}
      </span>
      {title.slice(end)}
    </span>
  );
}

/**
 * Hero Section: chọn thành phố, tên phim, rạp rồi bấm Tìm suất chiếu.
 * Khi tìm, chỉ gọi onSearch({ city, cinema, movieTitle }). Component cha (SearchBooking)
 * truyền dữ liệu này cho BookingFlow, luồng sẽ bắt đầu thẳng từ bước chọn suất chiếu.
 */
export default function HeroSection({
  movies = [],
  movieTitles = [],
  onSearch,
  searching = false,
}) {
  const [cities, setCities] = useState([]);
  // 'loading' | 'ready' | 'empty' | 'error'
  const [citiesStatus, setCitiesStatus] = useState('loading');
  const [selectedCity, setSelectedCity] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');

  // Nội dung người dùng gõ vào ô phim, được phép nhập tự do
  const [movieQuery, setMovieQuery] = useState('');
  // Mục gợi ý đang được trỏ bằng bàn phím, -1 là chưa trỏ mục nào
  const [activeIndex, setActiveIndex] = useState(-1);

  // Chỉ một menu được mở tại một thời điểm: 'city' | 'cinema' | 'movie' | null
  const [openMenu, setOpenMenu] = useState(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  // Nhắc nhở khi thiếu thông tin: danh sách trường bị thiếu và bộ đếm để chạy lại hiệu ứng rung
  const [missing, setMissing] = useState([]);
  const [shakeId, setShakeId] = useState(0);

  const displayMovieTitles = useMemo(() => {
    const raw =
      movieTitles.length > 0 ? movieTitles : movies.map((m) => m.title || m.name).filter(Boolean);
    return Array.from(new Set(raw));
  }, [movies, movieTitles]);

  const suggestions = useMemo(
    () => displayMovieTitles.filter((title) => matchesQuery(title, movieQuery)),
    [displayMovieTitles, movieQuery]
  );

  const toggleMenu = (name) => setOpenMenu((current) => (current === name ? null : name));

  const effectiveCinema = selectedCinema || ALL_CINEMAS;
  const fieldValues = { city: selectedCity, movie: movieQuery.trim(), cinema: effectiveCinema };
  // Trường nào đã được điền lại thì tự động hết cảnh báo
  const activeMissing = missing.filter((key) => !fieldValues[key]);
  const isMissing = (key) => activeMissing.includes(key);
  const fieldButtonClass = (key) =>
    `${FIELD_BUTTON} ${isMissing(key) ? 'bm-shake !border-[var(--color-system-error)]' : ''}`;

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

  // Có thành phố và tên phim thì tải các rạp đang chiếu phim đó (đợi 300ms sau lần gõ cuối)
  useEffect(() => {
    if (!selectedCity) return;
    const movie = movieQuery.trim();
    if (!movie) {
      setCinemas([]);
      setSelectedCinema(ALL_CINEMAS);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ city: selectedCity, movieTitle: movie });
        const res = await fetch(`${API_BASE_URL}/getCinemasByCity?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setCinemas(Array.isArray(data) ? data : []);
        setSelectedCinema(ALL_CINEMAS);
      } catch (err) {
        console.error('Lỗi khi tải rạp theo phim:', err);
        if (!cancelled) {
          setCinemas([]);
          setSelectedCinema(ALL_CINEMAS);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedCity, movieQuery]);

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

  function handleMovieChange(event) {
    setMovieQuery(event.target.value);
    setActiveIndex(-1);
    setOpenMenu('movie');
  }

  function pickSuggestion(title) {
    setMovieQuery(title);
    setActiveIndex(-1);
    setOpenMenu(null);
  }

  function clearMovie() {
    setMovieQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
    setOpenMenu('movie');
  }

  function handleMovieKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (suggestions.length === 0) return;
      event.preventDefault();
      setOpenMenu('movie');
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => {
        const next = current + step;
        if (next < 0) return suggestions.length - 1;
        if (next >= suggestions.length) return 0;
        return next;
      });
    } else if (event.key === 'Enter' && openMenu === 'movie' && activeIndex >= 0) {
      // Đang trỏ vào một gợi ý thì Enter chỉ chọn gợi ý, chưa gửi form
      event.preventDefault();
      pickSuggestion(suggestions[activeIndex]);
    }
  }

  function handleFindShowtimes(event) {
    event.preventDefault();
    if (searching) return;

    const emptyKeys = REQUIRED_FIELDS.map((f) => f.key).filter((key) => !fieldValues[key]);
    if (emptyKeys.length > 0) {
      setMissing(emptyKeys);
      setShakeId((n) => n + 1);
      setOpenMenu(emptyKeys[0]);
      return;
    }
    setMissing([]);
    setOpenMenu(null);

    // Chỉ gọi onSearch một lần. Không còn onSelectShowtime vì gọi cả hai với cùng dữ liệu
    // sẽ làm luồng đặt vé bị mở và tải lại hai lần.
    if (typeof onSearch === 'function') {
      onSearch({
        city: selectedCity,
        cinema: effectiveCinema,
        movieTitle: movieQuery.trim(),
      });
    }
  }

  // Ô rạp chiếu chỉ hiện sau khi đã chọn thành phố và nhập tên phim
  const hasQuery = movieQuery.trim().length > 0;
  const showCinema = Boolean(selectedCity) && hasQuery;
  const showMovieMenu = openMenu === 'movie' && (suggestions.length > 0 || movieQuery.trim());

  return (
    // z-30 để dropdown luôn nổi lên trên section phía dưới (nguyên nhân phổ biến gây che khuất)
    <section className="animate-fade-in relative z-30 mx-auto max-w-[1200px] overflow-visible px-4 sm:px-6">
      <form
        ref={formRef}
        onSubmit={handleFindShowtimes}
        className={`relative grid items-end gap-3 overflow-visible rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-translucent-card)] p-4 shadow-[var(--shadow-float)] backdrop-blur-xl sm:grid-cols-2 sm:p-5 ${
          showCinema ? 'lg:grid-cols-[1fr_1.4fr_1fr_auto]' : 'lg:grid-cols-[1fr_1.4fr_auto]'
        }`}
      >
        {/* 1. Khu vực */}
        <div className={`relative ${openMenu === 'city' ? 'z-50' : 'z-10'}`}>
          <label className={FIELD_LABEL}>Khu vực</label>
          <button
            type="button"
            aria-haspopup="listbox"
            key={`city-btn-${shakeId}`}
            aria-expanded={openMenu === 'city'}
            onClick={() => toggleMenu('city')}
            className={fieldButtonClass('city')}
          >
            <span className="truncate">{selectedCity || 'Chọn thành phố'}</span>
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${
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
                cities.map((c, index) => (
                  <button
                    key={c}
                    type="button"
                    role="option"
                    aria-selected={selectedCity === c}
                    onClick={() => {
                      setSelectedCity(c);
                      setOpenMenu(null);
                    }}
                    style={itemDelay(index)}
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

        {/* 2. Phim: ô nhập tự do, có gợi ý lọc theo từng ký tự */}
        <div className={`relative ${openMenu === 'movie' ? 'z-50' : 'z-10'}`}>
          <label htmlFor={`${listId}-movie`} className={FIELD_LABEL}>
            Tên phim
          </label>
          <div className={`${FIELD_INPUT_WRAP} ${isMissing('movie') ? 'bm-shake !border-[var(--color-system-error)]' : ''}`}>
            <SearchIcon />
            <input
              id={`${listId}-movie`}
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={Boolean(showMovieMenu)}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
              autoComplete="off"
              value={movieQuery}
              onChange={handleMovieChange}
              onFocus={() => setOpenMenu('movie')}
              onKeyDown={handleMovieKeyDown}
              placeholder="Nhập tên phim để tìm"
              className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
            {/* Nút xóa: mờ dần vào, mờ dần ra thay vì xuất hiện đột ngột */}
            <button
              type="button"
              aria-label="Xóa nội dung tìm phim"
              tabIndex={hasQuery ? 0 : -1}
              onClick={clearMovie}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-fill-secondary)] hover:text-[var(--color-text-primary)] active:scale-90 ${
                hasQuery ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0'
              }`}
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>

          {showMovieMenu && (
            <div id={listId} role="listbox" className={`${MENU_PANEL} max-h-60`}>
              {suggestions.length > 0 ? (
                <>
                  {suggestions.map((title, index) => (
                    <button
                      key={title}
                      id={`${listId}-opt-${index}`}
                      type="button"
                      role="option"
                      aria-selected={movieQuery === title}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pickSuggestion(title)}
                      style={itemDelay(index)}
                      className={`${MENU_ITEM_BASE} ${
                        movieQuery === title
                          ? MENU_ITEM_ACTIVE
                          : index === activeIndex
                            ? MENU_ITEM_FOCUS
                            : MENU_ITEM_IDLE
                      }`}
                    >
                      <HighlightedTitle title={title} query={movieQuery} selected={movieQuery === title} />
                    </button>
                  ))}
                </>
              ) : (
                <p className="bm-rise px-3 py-2 text-center text-xs text-[var(--color-text-secondary)]">
                  Không có phim trùng với "{movieQuery.trim()}". Bấm Tìm suất chiếu để thử tìm theo từ khóa này.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 3. Rạp chiếu (chỉ hiện khi đã có thành phố và tên phim) */}
        {showCinema && (
          <div className={`bm-rise relative ${openMenu === 'cinema' ? 'z-50' : 'z-10'}`}>
            <label className={FIELD_LABEL}>Rạp chiếu</label>
            <button
              type="button"
              aria-haspopup="listbox"
              key={`cinema-btn-${shakeId}`}
              aria-expanded={openMenu === 'cinema'}
              onClick={() => toggleMenu('cinema')}
              className={fieldButtonClass('cinema')}
            >
              <span className="truncate">{effectiveCinema}</span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${
                  openMenu === 'cinema' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openMenu === 'cinema' && (
              <div role="listbox" className={`${MENU_PANEL} max-h-60`}>
                {cinemas.length > 0 ? (
                  <>
                    <button
                      type="button"
                      role="option"
                      aria-selected={effectiveCinema === ALL_CINEMAS}
                      onClick={() => {
                        setSelectedCinema(ALL_CINEMAS);
                        setOpenMenu(null);
                      }}
                      className={`${MENU_ITEM_BASE} ${
                        effectiveCinema === ALL_CINEMAS ? MENU_ITEM_ACTIVE : MENU_ITEM_IDLE
                      }`}
                    >
                      <span className="truncate">{ALL_CINEMAS}</span>
                    </button>
                    {cinemas.map((c, index) => {
                      const name = typeof c === 'string' ? c : c.name;
                      return (
                        <button
                          key={c.cinemaId || name}
                          type="button"
                          role="option"
                          aria-selected={selectedCinema === name}
                          onClick={() => {
                            setSelectedCinema(name);
                            setOpenMenu(null);
                          }}
                          style={itemDelay(index)}
                          className={`${MENU_ITEM_BASE} ${
                            selectedCinema === name ? MENU_ITEM_ACTIVE : MENU_ITEM_IDLE
                          }`}
                        >
                          <span className="truncate">{name}</span>
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <p className="px-3 py-2 text-center text-xs text-[var(--color-text-secondary)]">
                    {`Không có rạp nào ở ${selectedCity} đang chiếu "${movieQuery.trim()}"`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. Tìm suất chiếu */}
        <button
          type="submit"
          disabled={searching}
          aria-busy={searching}
          className={`flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-brand-fill)] px-6 text-[13px] font-semibold text-[var(--color-brand-on-primary)] transition-[background-color,transform] duration-200 ease-[var(--ease-out)] hover:bg-[var(--color-brand-fill-hover)] active:scale-95 disabled:cursor-wait disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 sm:self-end ${showCinema ? '' : 'sm:col-span-2'} lg:col-span-1`}
        >
          {searching ? <span className="bm-spinner" aria-hidden="true" /> : <SearchIcon />}
          <span>{searching ? 'Đang tìm...' : 'Tìm suất chiếu'}</span>
        </button>
      </form>

      {activeMissing.length > 0 && (
        <div
          key={`alert-${shakeId}`}
          role="alert"
          className="bm-rise mt-3 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-system-error)]/40 bg-[var(--color-system-error)]/10 px-4 py-3 text-[13px] font-medium text-[var(--color-system-error)]"
        >
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-system-error)]" />
          <p>
            Vui lòng chọn{' '}
            {REQUIRED_FIELDS.filter((f) => activeMissing.includes(f.key))
              .map((f) => f.label)
              .join(', ')}{' '}
            trước khi tìm suất chiếu.
          </p>
        </div>
      )}
    </section>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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