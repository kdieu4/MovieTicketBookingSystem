import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tài khoản"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-separator)] bg-[var(--color-fill-secondary)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
      >
        <UserIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] shadow-lg"
        >
          <MenuItem onClick={() => setOpen(false)}>Thông tin cá nhân</MenuItem>
          <MenuItem onClick={() => setOpen(false)}>Cài đặt</MenuItem>

          <div className="border-t border-[var(--color-border-separator)] px-3 py-3">
            <p className="text-xs text-[var(--color-text-secondary)]">Giao diện</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ThemeOption label="Sáng" active={theme === 'light'} onClick={() => setTheme('light')} />
              <ThemeOption label="Tối" active={theme === 'dark'} onClick={() => setTheme('dark')} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ children, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="block w-full px-4 py-2.5 text-left text-sm text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)]"
    >
      {children}
    </button>
  );
}

function ThemeOption({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
        active
          ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)]'
          : 'bg-[var(--color-fill-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {label}
    </button>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 15c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}