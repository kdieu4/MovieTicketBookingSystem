"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      <main className="animate-fade-in w-full flex-1 mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Quản lý giao diện và tùy chọn thông báo.</p>

        <div className="mt-8 space-y-6">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-low)]">
            <h2 className="text-base font-semibold">Giao diện ứng dụng</h2>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Tùy chỉnh chế độ hiển thị Sáng hoặc Tối theo sở thích.
            </p>

            <div className="relative mt-4 grid grid-cols-2 gap-3 max-w-sm rounded-[var(--radius-sm)] bg-[var(--color-fill-secondary)] p-1">
              <div
                aria-hidden="true"
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-10px)] rounded-[var(--radius-xs)] bg-[var(--color-brand-fill)] shadow-[var(--shadow-low)] transition-transform duration-300 ease-out pointer-events-none ${
                  theme === 'dark' ? 'translate-x-[calc(100%+12px)]' : 'translate-x-0'
                }`}
              />

              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                className={`relative z-10 h-9 rounded-[var(--radius-xs)] text-xs font-semibold transition-colors duration-300 ${
                  theme === 'light'
                    ? 'text-[var(--color-brand-on-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Theme Sáng
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                className={`relative z-10 h-9 rounded-[var(--radius-xs)] text-xs font-semibold transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'text-[var(--color-brand-on-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Theme Tối
              </button>
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-low)]">
            <h2 className="text-base font-semibold">Thông báo</h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Nhắc nhở lịch chiếu</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Nhận thông báo trước giờ chiếu 1 tiếng</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-brand-fill)]" />
              </label>

              <label className="flex items-center justify-between border-t border-[var(--color-border-separator)] pt-4">
                <div>
                  <p className="text-sm font-medium">Email tin tức & Khuyến mãi</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Cập nhật ưu đãi vé hàng tuần</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-brand-fill)]" />
              </label>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}