"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { SegmentedControl, Switch } from 'glisse';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      {/* justify-center: trang cài đặt ngắn nên căn giữa theo chiều dọc phần
          trống còn lại giữa header và footer, tránh một khoảng trắng lớn dưới thẻ. */}
      <main className="animate-fade-in mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">Cài đặt hệ thống</h1>

        <div className="mt-6 space-y-5">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-low)]">
            <h2 className="text-base font-semibold">Tài khoản</h2>

            <ul className="mt-3 divide-y divide-[var(--color-border-separator)]">
              <li>
                <Link
                  href="/ve-cua-toi"
                  className="flex items-center justify-between gap-4 py-3 text-sm font-medium transition-colors hover:text-[var(--color-brand-primary)]"
                >
                  <span>
                    Vé của tôi
                    <span className="mt-0.5 block text-xs font-normal text-[var(--color-text-secondary)]">
                      Xem các giao dịch đặt vé đã thực hiện
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-[var(--color-text-tertiary)]">→</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/thong-tin-ca-nhan"
                  className="flex items-center justify-between gap-4 py-3 text-sm font-medium transition-colors hover:text-[var(--color-brand-primary)]"
                >
                  <span>
                    Thông tin cá nhân
                    <span className="mt-0.5 block text-xs font-normal text-[var(--color-text-secondary)]">
                      Họ tên, số điện thoại, email
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-[var(--color-text-tertiary)]">→</span>
                </Link>
              </li>
            </ul>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-low)]">
            <h2 className="text-base font-semibold">Giao diện ứng dụng</h2>

            <div className="mt-4">
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
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-low)]">
            <h2 className="text-base font-semibold">Thông báo</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Nhắc nhở lịch chiếu</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Nhận thông báo trước giờ chiếu 1 tiếng</p>
                </div>
                <Switch aria-label="Nhắc nhở lịch chiếu" defaultChecked />
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border-separator)] pt-4">
                <div>
                  <p className="text-sm font-medium">Email tin tức &amp; Khuyến mãi</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Cập nhật ưu đãi vé hàng tuần</p>
                </div>
                <Switch aria-label="Email tin tức và khuyến mãi" defaultChecked />
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}