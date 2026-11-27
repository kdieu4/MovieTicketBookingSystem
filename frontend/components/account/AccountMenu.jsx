"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import {
  GlassTabs,
  GlassMenu,
  GlassMenuTrigger,
  GlassMenuContent,
  GlassMenuItem,
  GlassMenuSeparator,
} from '@/components/liquid-glass';

export default function AccountMenu() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
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
      setLoggingOut(false);
      // Báo cho Header/RequireAuth biết phiên đã mất, không phải chờ đổi trang.
      window.dispatchEvent(new Event('mtbs-auth-changed'));
      router.push('/');
      router.refresh();
    }
  }

  return (
    <GlassMenu>
      {/* Trigger của kit: bấm vào menu "nở" ra từ chính nút này. Chỉ có icon nên bắt buộc aria-label.
          Giữ nguyên chất liệu gốc của kit (kính trong, tự lấy màu nền trang); chỉ ép lại kích thước
          40x40 tròn bằng `!` vì class mặc định h-12 px-5 của GlassMenuTrigger sẽ thắng. */}
      <GlassMenuTrigger
        aria-label="Tài khoản"
        className="h-10! w-10! gap-0 rounded-full px-0! [&_svg]:size-[18px]"
      >
        <UserIcon />
      </GlassMenuTrigger>

      <GlassMenuContent align="end" sideOffset={10} className="w-60 text-[13px]">
        <GlassMenuItem render={<Link href="/thong-tin-ca-nhan" />}>
          Thông tin cá nhân
        </GlassMenuItem>
        <GlassMenuItem render={<Link href="/ve-cua-toi" />}>Vé của tôi</GlassMenuItem>
        <GlassMenuItem render={<Link href="/cai-dat" />}>
          Cài đặt tài khoản
        </GlassMenuItem>

        {/* Theme vẫn là GlassTabs: menu chỉ là khung, không tự vẽ chữ hay ô chọn. */}
        <GlassMenuSeparator />
        <div role="group" aria-label="Giao diện" className="px-3.5 py-2">
          <p className="text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
            Giao diện
          </p>

          <div className="mt-2">
            <GlassTabs
              aria-label="Chế độ hiển thị"
              size="sm"
              value={theme}
              onValueChange={setTheme}
              options={[
                { value: 'light', label: 'Sáng' },
                { value: 'dark', label: 'Tối' },
              ]}
            />
          </div>
        </div>

        <GlassMenuSeparator />

        {logoutError && (
          <p className="px-3.5 pb-1 text-[11px] text-[var(--color-system-warning)]">{logoutError}</p>
        )}

        <GlassMenuItem
          disabled={loggingOut}
          onSelect={handleLogout}
          // Không dùng `destructive` của kit (đỏ cố định): token lỗi của app tự đổi theo theme.
          className="font-semibold text-[var(--color-system-error)]"
        >
          <LogoutIcon />
          {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </GlassMenuItem>
      </GlassMenuContent>
    </GlassMenu>
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
