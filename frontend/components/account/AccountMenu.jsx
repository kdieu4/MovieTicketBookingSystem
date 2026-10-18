"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

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
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-separator)] bg-[var(--color-fill-secondary)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
      >
        <UserIcon />
      </button>

      {(
        <div
          role="menu"
          aria-hidden={!open}
          className={`absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-translucent-card)] p-1.5 shadow-[var(--shadow-high)] backdrop-blur-xl origin-top-right transition-all duration-200 ease-out ${
            open
              ? 'visible translate-y-0 scale-100 opacity-100'
              : 'invisible pointer-events-none -translate-y-1 scale-95 opacity-0'
          }`}
        >
          <Link
            href="/thong-tin-ca-nhan"
            onClick={() => setOpen(false)}
            className="block w-full rounded-[var(--radius-xs)] px-3 py-2 text-left text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)]"
          >
            Thông tin cá nhân
          </Link>
          <Link
            href="/cai-dat"
            onClick={() => setOpen(false)}
            className="block w-full rounded-[var(--radius-xs)] px-3 py-2 text-left text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)]"
          >
            Cài đặt tài khoản
          </Link>

          <div className="mt-1 border-t border-[var(--color-border-separator)] px-2.5 pt-2.5 pb-1">
            <p className="text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">Giao diện</p>

            <div className="relative mt-2 grid grid-cols-2 gap-1 rounded-[var(--radius-sm)] bg-[var(--color-fill-secondary)] p-1">
              <div
                aria-hidden="true"
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] shadow-[var(--shadow-low)] transition-transform duration-300 ease-out pointer-events-none ${
                  theme === 'dark' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                }`}
              />

              <ThemeOption label="Sáng" active={theme === 'light'} onClick={() => setTheme('light')} />
              <ThemeOption label="Tối" active={theme === 'dark'} onClick={() => setTheme('dark')} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeOption({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative z-10 h-7 rounded-[var(--radius-xs)] text-xs font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
        active
          ? 'text-[var(--color-brand-on-primary)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
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