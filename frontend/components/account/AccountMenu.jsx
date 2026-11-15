"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { Button, Glass, SegmentedControl } from 'glisse';

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const containerRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Đăng xuất: xoá cookie phía server (route BFF), rồi dọn dữ liệu phiên ở client
  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError('');

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      setLogoutError('Không kết nối được máy chủ, nhưng đã xoá phiên trên máy.');
    } finally {
      try {
        window.sessionStorage.removeItem('mtbs_user_id');
        window.sessionStorage.removeItem('mtbs_user_name');
      } catch {
        // Trình duyệt chặn storage thì bỏ qua
      }

      setLoggingOut(false);
      setOpen(false);
      router.push('/');
      router.refresh();
    }
  }

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
      {/* Nút kính của glisse: 40x40, chỉ icon nên bắt buộc có aria-label. */}
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tài khoản"
        icon={<UserIcon />}
      />

      {(
        // Bề mặt menu dùng token --lg-surface của glisse để khớp với menu gốc thư viện.
        <Glass
          role="menu"
          aria-hidden={!open}
          className={`glass-panel absolute right-0 top-full z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-[20px] p-1.5 transition-all duration-200 ease-out ${
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
            href="/ve-cua-toi"
            onClick={() => setOpen(false)}
            className="block w-full rounded-[var(--radius-xs)] px-3 py-2 text-left text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)]"
          >
            Vé của tôi
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

            <div className="mt-2">
              <SegmentedControl
                aria-label="Chế độ hiển thị"
                value={theme}
                onValueChange={setTheme}
                items={[
                  { value: 'light', label: 'Sáng' },
                  { value: 'dark', label: 'Tối' },
                ]}
              />
            </div>
          </div>

          <div className="mt-1 border-t border-[var(--color-border-separator)] px-1.5 pt-1.5">
            {logoutError && (
              <p className="px-2 pb-1 text-[11px] text-[var(--color-system-warning)]">
                {logoutError}
              </p>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 rounded-[var(--radius-xs)] px-3 py-2 text-left text-xs font-semibold text-[var(--color-system-error)] transition-colors hover:bg-[var(--color-system-error)]/10 disabled:opacity-60"
            >
              <LogoutIcon />
              {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>
        </Glass>
      )}
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M11.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4.5A1.5 1.5 0 0 0 3 4v10a1.5 1.5 0 0 0 1.5 1.5H10a1.5 1.5 0 0 0 1.5-1.5v-1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M8 9h7m0 0-2.2-2.2M15 9l-2.2 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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