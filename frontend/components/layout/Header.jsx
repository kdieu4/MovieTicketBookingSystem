"use client";

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BRAND_NAME } from '@/styles/tokens';
import AccountMenu from '@/components/account/AccountMenu';
import { Reveal, Skeleton } from '@/components/common/Ascii';

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Rạp chiếu', href: '/rap-chieu' },
  { label: 'Ưu đãi', href: '/uu-dai' },
];

// Chỉ hiện khi đang xem chi tiết phim, chèn giữa "Trang chủ" và "Rạp chiếu".
const MOVIE_TAB = { label: 'Phim', href: '/#phim', detailOnly: true };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8083';
const SEARCH_LIMIT = 6;
const SEARCH_DEBOUNCE_MS = 250;
const PANEL_BORDER = 2; // 1px viền trên + 1px viền dưới

const SEARCH_ANIMATIONS = `
@keyframes hdr-item-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hdr-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hdr-load {
  from { transform: translateX(-100%); }
  to { transform: translateX(260%); }
}
@keyframes hdr-nav-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
.hdr-item { animation: hdr-item-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.hdr-fade { animation: hdr-fade-in 240ms ease-out both; }
.hdr-bar { animation: hdr-load 1s ease-in-out infinite; }
.hdr-nav-in { animation: hdr-nav-in var(--motion-base) var(--ease-out) both; }
.hdr-indicator {
  transition:
    transform var(--motion-base) var(--ease-out),
    width var(--motion-base) var(--ease-out),
    opacity var(--motion-base) var(--ease-out);
}
@media (prefers-reduced-motion: reduce) {
  .hdr-item, .hdr-fade, .hdr-bar, .hdr-nav-in { animation: none !important; }
  .hdr-indicator { transition: none; }
}
`;

function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function Highlight({ text, query }) {
  const source = (text ?? '').normalize('NFC');
  const keyword = query.trim();
  const index = keyword ? normalize(source).indexOf(normalize(keyword)) : -1;
  if (index < 0) return <>{source}</>;
  const end = index + keyword.length;
  return (
    <>
      {source.slice(0, index)}
      <mark className="bg-transparent text-[var(--color-brand-primary)]">
        {source.slice(index, end)}
      </mark>
      {source.slice(end)}
    </>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const pathname = usePathname();
  const router = useRouter();

  // Trang chi tiết phim có thêm tab "Phim" trên thanh điều hướng nổi.
  const isMovieDetail = pathname?.startsWith('/phim/') ?? false;
  const navLinks = isMovieDetail
    ? [NAV_LINKS[0], MOVIE_TAB, ...NAV_LINKS.slice(1)]
    : NAV_LINKS;

  const [hoverIndex, setHoverIndex] = useState(null);
  const searchBoxRef = useRef(null);
  const panelInnerRef = useRef(null);

  const activeIndex = navLinks.findIndex((link) =>
    link.detailOnly
      ? isMovieDetail
      : link.href === '/'
        ? pathname === '/'
        : pathname?.startsWith(link.href)
  );

  // Thanh có 3 hoặc 4 mục nên phải đo mục đang chọn thay vì chia đều.
  const itemRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const targetIndex = hoverIndex !== null ? hoverIndex : activeIndex;
  const indicatorIndex = Math.max(targetIndex, 0);

  useLayoutEffect(() => {
    const el = itemRefs.current[indicatorIndex];
    if (!el) return;
    const measure = () =>
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [indicatorIndex, pathname]);

  // Đổi trang thì bỏ hover để viên chỉ báo không trỏ nhầm mục.
  useEffect(() => {
    setHoverIndex(null);
  }, [pathname]);

  // ---- Tìm kiếm qua API ----
  const keyword = searchValue.trim();
  const hasQuery = keyword.length > 0;
  const showPanel = searchFocused && hasQuery;

  useEffect(() => {
    if (!keyword) {
      setResults([]);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/searchMovies?keyword=${encodeURIComponent(keyword)}&limit=${SEARCH_LIMIT}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setResults(await res.json());
        setStatus('done');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('searchMovies lỗi:', error);
          setResults([]);
          setStatus('error');
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword]);

  // Giữ panel trong DOM đủ lâu để chạy hiệu ứng đóng
  const [panelRendered, setPanelRendered] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    if (showPanel) {
      setPanelRendered(true);
      const raf = requestAnimationFrame(() => setPanelVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setPanelVisible(false);
    const timer = setTimeout(() => setPanelRendered(false), 200);
    return () => clearTimeout(timer);
  }, [showPanel]);

  // Đo chiều cao nội dung để panel co giãn mượt khi kết quả thay đổi
  const [panelHeight, setPanelHeight] = useState(null);

  useLayoutEffect(() => {
    if (!panelRendered) {
      setPanelHeight(null);
      return;
    }
    const el = panelInnerRef.current;
    if (!el) return;
    const measure = () => setPanelHeight(el.offsetHeight + PANEL_BORDER);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [panelRendered]);

  useEffect(() => {
    setActiveResult(-1);
  }, [results]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function closeSearch() {
    setSearchFocused(false);
    setSearchValue('');
  }

  function openMovie(movie) {
    router.push(`/phim/${movie.movieId}`);
    closeSearch();
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    // Không còn trang danh sách phim, Enter mở thẳng phim đang chọn (hoặc gợi ý đầu tiên).
    const movie = activeResult >= 0 ? results[activeResult] : results[0];
    if (movie) openMovie(movie);
  }

  async function handleMobileSearch(event) {
    event.preventDefault();
    const query = mobileQuery.trim();
    if (!query) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/searchMovies?keyword=${encodeURIComponent(query)}&limit=1`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const [movie] = await res.json();
      if (movie) {
        setMenuOpen(false);
        setMobileQuery('');
        router.push(`/phim/${movie.movieId}`);
      }
    } catch (error) {
      console.error('searchMovies lỗi:', error);
    }
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveResult((i) => (results.length ? (i + 1) % results.length : -1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResult((i) => (results.length ? (i <= 0 ? results.length - 1 : i - 1) : -1));
    } else if (event.key === 'Escape') {
      setSearchFocused(false);
      event.currentTarget.blur();
    }
  }

  const isLoading = status === 'loading';
  const showSkeleton = isLoading && results.length === 0;
  const showEmpty = status === 'done' && results.length === 0;
  const showError = status === 'error';

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-separator)] bg-[var(--color-bg-translucent-header)] backdrop-blur-xl backdrop-saturate-180 transition-colors duration-200">
      <style>{SEARCH_ANIMATIONS}</style>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 text-[var(--color-text-primary)] transition-opacity hover:opacity-80">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-brand-primary)]">
              <span className="h-3 w-3 rounded-full bg-[var(--color-brand-fill)]" />
            </span>
            <span className="text-base font-semibold tracking-tight">{BRAND_NAME}</span>
          </Link>
        </div>

        {/* Floating Navigation Bar Center */}
        <nav className="hidden md:flex items-center" aria-label="Điều hướng chính">
          <div
            onMouseLeave={() => setHoverIndex(null)}
            className="relative flex items-center rounded-full border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-1 backdrop-blur-md"
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-1 left-0 top-1 rounded-full bg-[var(--color-fill-secondary)] ${
                indicator.ready ? 'hdr-indicator' : ''
              }`}
              style={{
                width: indicator.width,
                transform: `translateX(${indicator.left}px)`,
                opacity: indicator.ready && targetIndex >= 0 ? 1 : 0,
              }}
            />

            {navLinks.map((link, idx) => {
              const isActive = activeIndex === idx;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  onMouseEnter={() => setHoverIndex(idx)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative z-10 flex h-8 items-center justify-center rounded-full px-4 text-[13px] font-medium transition-colors duration-200 ${
                    link.detailOnly ? 'hdr-nav-in' : ''
                  } ${
                    isActive
                      ? 'text-[var(--color-brand-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Search & Actions Right */}
        <div className="flex items-center gap-3">
          <div ref={searchBoxRef} className="relative hidden sm:block">
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              className={`flex items-center gap-2 rounded-full border bg-[var(--color-fill-tertiary)] px-3.5 py-1.5 transition-[border-color,background-color,box-shadow] duration-300 ${
                searchFocused
                  ? 'border-[var(--color-brand-primary)] bg-[var(--color-bg-tertiary)] shadow-[0_0_0_3px_var(--color-focus-ring)]'
                  : 'border-[var(--color-border-separator)]'
              }`}
            >
              <SearchIcon />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm phim, đạo diễn..."
                role="combobox"
                aria-expanded={showPanel}
                aria-controls="search-results"
                aria-autocomplete="list"
                className="w-40 bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none lg:w-64"
              />
            </form>

            {/*
              Menu gợi ý: mép phải thẳng với ô tìm kiếm. Từ màn hình lg trở lên
              ô tìm kiếm rộng bằng menu nên hai mép trái phải đều thẳng hàng.
            */}
            {panelRendered && (
              <div
                id="search-results"
                role="listbox"
                style={{ height: panelHeight ?? 'auto' }}
                className={`absolute right-0 top-full z-50 mt-2 w-[max(100%,19rem)] max-w-[calc(100vw-2rem)] origin-top overflow-hidden rounded-2xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] shadow-[var(--shadow-high)] backdrop-blur-xl transition-[height,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  panelVisible
                    ? 'translate-y-0 scale-100 opacity-100'
                    : '-translate-y-2 scale-[0.97] opacity-0'
                }`}
              >
                {/* Thanh tiến trình khi đang tìm */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden transition-opacity duration-300 ${
                    isLoading ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="hdr-bar h-full w-2/5 rounded-full bg-[var(--color-brand-fill)]" />
                </div>

                <div ref={panelInnerRef} className="p-2">
                  <Reveal loading={showSkeleton} shimmer={false} lazy={false}>
                  {results.length > 0 && (
                    <>
                      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
                        Phim phù hợp
                      </p>
                      <ul
                        className={`transition-opacity duration-200 ${
                          isLoading ? 'opacity-60' : 'opacity-100'
                        }`}
                      >
                        {results.map((movie, i) => (
                          <li
                            key={movie.movieId}
                            className="hdr-item"
                            style={{ animationDelay: `${i * 40}ms` }}
                          >
                            <button
                              type="button"
                              role="option"
                              aria-selected={activeResult === i}
                              onMouseEnter={() => setActiveResult(i)}
                              onClick={() => openMovie(movie)}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-150 ${
                                activeResult === i ? 'bg-[var(--color-fill-tertiary)]' : ''
                              }`}
                            >
                              <MoviePoster movie={movie} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold leading-5 text-[var(--color-text-primary)]">
                                  <Highlight text={movie.title} query={searchValue} />
                                </span>
                                <span className="block truncate text-xs leading-5 text-[var(--color-text-secondary)]">
                                  {movie.director ? (
                                    <Highlight text={movie.director} query={searchValue} />
                                  ) : (
                                    'Chưa có đạo diễn'
                                  )}
                                  {movie.releaseDate ? ` · ${movie.releaseDate.slice(0, 4)}` : ''}
                                </span>
                                {movie.genres?.length > 0 && (
                                  <span className="block truncate text-[11px] leading-4 text-[var(--color-text-tertiary)]">
                                    {movie.genres.map((g) => g.name).join(', ')}
                                  </span>
                                )}
                              </span>
                              <ArrowIcon
                                className={`shrink-0 text-[var(--color-text-tertiary)] transition-all duration-200 ${
                                  activeResult === i ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'
                                }`}
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {showSkeleton && (
                    <ul className="hdr-fade" aria-label="Đang tìm kiếm">
                      {[0, 1, 2].map((n) => (
                        <li key={n} className="flex items-center gap-3 rounded-xl px-3 py-2">
                          <Skeleton rows={4} width={40} height={56} className="shrink-0 rounded-md" />
                          <span className="flex-1">
                            <Skeleton lines={2} widths={['76%', '48%']} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {showEmpty && (
                    <div className="hdr-fade px-3 py-6 text-center">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Không tìm thấy kết quả
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        Thử tên phim hoặc tên đạo diễn khác
                      </p>
                    </div>
                  )}

                  {showError && (
                    <div className="hdr-fade px-3 py-6 text-center">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Không kết nối được máy chủ
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        Kiểm tra movie-service và thử lại
                      </p>
                    </div>
                  )}
                  </Reveal>
                </div>
              </div>
            )}
          </div>

          {pathname !== '/dang-nhap' && (
            <Link
              href="/dang-nhap"
              className="hidden h-9 items-center justify-center rounded-full bg-[var(--color-brand-fill)] px-4 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-fill-hover)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] sm:inline-flex"
            >
              Đăng nhập
            </Link>
          )}

          <div className="hidden sm:block">
            <AccountMenu />
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-primary)] hover:bg-[var(--color-fill-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] md:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="animate-fade-in border-t border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] px-4 pb-4 pt-3 md:hidden">
          <form
            onSubmit={handleMobileSearch}
            role="search"
            className="mb-3 flex h-10 items-center gap-2 rounded-full border border-[var(--color-border-separator)] bg-[var(--color-fill-tertiary)] pl-3.5 pr-1"
          >
            <SearchIcon />
            <input
              type="search"
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="Tìm phim, đạo diễn..."
              aria-label="Tìm phim"
              className="min-w-0 flex-1 bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
            />
            <button
              type="submit"
              className="h-8 shrink-0 rounded-full bg-[var(--color-brand-fill)] px-3.5 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-fill-hover)] active:scale-95"
            >
              Tìm
            </button>
          </form>

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {pathname !== '/dang-nhap' && (
            <Link
              href="/dang-nhap"
              onClick={() => setMenuOpen(false)}
              className="mt-3 flex h-10 items-center justify-center rounded-full bg-[var(--color-brand-fill)] text-sm font-semibold text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-fill-hover)] active:scale-[0.98]"
            >
              Đăng nhập
            </Link>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border-separator)] pt-3">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Giao diện & Tài khoản</span>
            <AccountMenu />
          </div>
        </div>
      )}
    </header>
  );
}

function MoviePoster({ movie }) {
  const [failed, setFailed] = useState(false);

  if (movie.posterUrl && !failed) {
    return (
      <Image
        src={movie.posterUrl}
        alt=""
        width={40}
        height={56}
        sizes="40px"
        onError={() => setFailed(true)}
        className="h-14 w-10 shrink-0 rounded-md bg-[var(--color-fill-secondary)] object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-fill-secondary)] text-sm font-semibold text-[var(--color-brand-primary)]"
    >
      {movie.title?.charAt(0)}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-tertiary)]" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--color-text-tertiary)]" />
    </svg>
  );
}

function ArrowIcon({ className = '' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5.5H17M3 10H17M3 14.5H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}