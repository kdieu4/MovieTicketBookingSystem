"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BRAND_NAME } from '@/styles/tokens';
import AccountMenu from '@/components/account/AccountMenu';

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Phim', href: '/phim' },
  { label: 'Rạp chiếu', href: '/rap-chieu' },
  { label: 'Ưu đãi', href: '/uu-dai' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const pathname = usePathname();

  const [hoverIndex, setHoverIndex] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef(null);
  const itemRefs = useRef([]);

  const activeIndex = NAV_LINKS.findIndex((link) =>
    link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href)
  );

  const targetIndex = hoverIndex !== null ? hoverIndex : (activeIndex >= 0 ? activeIndex : 0);

  useEffect(() => {
    const currentItem = itemRefs.current[targetIndex];
    if (currentItem && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = currentItem.getBoundingClientRect();
      setIndicatorStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
        opacity: 1,
      });
    }
  }, [targetIndex, pathname]);

  function handleSearchSubmit(event) {
    event.preventDefault();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-separator)] bg-[var(--color-bg-translucent-header)] backdrop-blur-xl backdrop-saturate-180 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 text-[var(--color-text-primary)] transition-opacity hover:opacity-80">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-brand-primary)]">
              <span className="h-3 w-3 rounded-full bg-[var(--color-brand-primary)]" />
            </span>
            <span className="text-base font-bold tracking-tight">{BRAND_NAME}</span>
          </Link>
        </div>

        {/* Floating Navigation Bar Center */}
        <nav className="hidden md:flex items-center">
          <div
            ref={navRef}
            onMouseLeave={() => setHoverIndex(null)}
            className="relative flex items-center rounded-full border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-1 shadow-sm backdrop-blur-md"
          >
            {/* Sliding Indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-[var(--color-fill-secondary)] transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />

            {NAV_LINKS.map((link, idx) => {
              const isActive = activeIndex === idx;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => (itemRefs.current[idx] = el)}
                  onMouseEnter={() => setHoverIndex(idx)}
                  className={`relative z-10 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-[var(--color-brand-primary)] font-bold'
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
          <form
            onSubmit={handleSearchSubmit}
            className="hidden items-center gap-2 rounded-full border border-[var(--color-border-separator)] bg-[var(--color-fill-tertiary)] px-3.5 py-1.5 transition-all focus-within:border-[var(--color-brand-primary)] focus-within:bg-[var(--color-bg-tertiary)] sm:flex"
          >
            <SearchIcon />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm phim, diễn viên..."
              className="w-36 bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none lg:w-48"
            />
          </form>

          <button
            type="button"
            className="hidden h-9 items-center justify-center rounded-full bg-[var(--color-brand-primary)] px-4 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-primary-hover)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] sm:inline-flex"
          >
            Đăng nhập
          </button>

          <button
            type="button"
            aria-label="Phim yêu thích"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] sm:inline-flex"
          >
            <HeartIcon />
          </button>

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
        <div className="border-t border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] px-4 pb-4 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
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
          <div className="mt-3 pt-3 border-t border-[var(--color-border-separator)] flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Giao diện & Tài khoản</span>
            <AccountMenu />
          </div>
        </div>
      )}
    </header>
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

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 15.5s-6-3.6-6-8.1C3 4.9 4.8 3.3 7 3.3c1 0 2 0.6 2 2 0-1.4 1-2 2-2 2.2 0 4 1.6 4 4.1 0 4.5-6 8.1-6 8.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
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