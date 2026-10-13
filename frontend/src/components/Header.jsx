import { useState } from 'react';
import { BRAND_NAME } from '../styles/tokens';
import AccountMenu from './AccountMenu';

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Phim', href: '/phim' },
  { label: 'Rạp chiếu', href: '/rap-chieu' },
  { label: 'Ưu đãi', href: '/uu-dai' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  function handleSearchSubmit(event) {
    event.preventDefault();
    // Tích hợp với trang kết quả tìm kiếm thật khi có router, ví dụ:
    // navigate(`/tim-kiem?q=${encodeURIComponent(searchValue)}`)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2 text-[var(--color-text-primary)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-brand-primary)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-brand-primary)]" />
            </span>
            <span className="text-base font-semibold tracking-wide">{BRAND_NAME}</span>
          </a>

          <nav className="hidden items-center gap-5 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="hidden items-center gap-2 rounded-full border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] px-3 py-1.5 sm:flex"
          >
            <SearchIcon />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm phim, diễn viên..."
              className="w-40 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none lg:w-56"
            />
          </form>

          <button
            type="button"
            className="hidden rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] sm:inline-block"
          >
            Đăng nhập
          </button>

          <button
            type="button"
            aria-label="Phim yêu thích"
            className="hidden rounded-full p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] sm:inline-flex"
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
            className="inline-flex items-center justify-center rounded-md p-2 text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] md:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-[var(--color-border-separator)] px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="mt-3 w-full rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-primary-hover)]"
          >
            Đăng nhập
          </button>
          <div className="mt-3 flex items-center justify-between rounded-md px-2 py-2">
            <span className="text-sm text-[var(--color-text-secondary)]">Tài khoản</span>
            <AccountMenu />
          </div>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5.5H17M3 10H17M3 14.5H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}