"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: 'Lê Quang Hiếu',
    email: 'hieulq@example.com',
    phone: '0987654321',
    city: 'Hà Nội',
  });

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      <main className="animate-fade-in w-full flex-1 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5 rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-medium)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-fill)] text-xl font-semibold text-[var(--color-brand-on-primary)]">
            LQH
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{formData.fullName}</h1>
            <p className="text-xs text-[var(--color-text-secondary)]">Thành viên VIP · 1,250 Điểm thưởng</p>
          </div>
        </div>

        <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-low)]">
          <h2 className="text-base font-semibold">Thông tin tài khoản</h2>

          <form className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">Họ và tên</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3.5 text-sm text-[var(--color-text-primary)] transition-[border-color,box-shadow] duration-200 focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">Số điện thoại</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3.5 text-sm text-[var(--color-text-primary)] transition-[border-color,box-shadow] duration-200 focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">Email</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="mt-1.5 h-11 w-full cursor-not-allowed rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-fill-tertiary)] px-3.5 text-sm text-[var(--color-text-secondary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">Thành phố</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3.5 text-sm text-[var(--color-text-primary)] transition-[border-color,box-shadow] duration-200 focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
              />
            </div>

            <div className="sm:col-span-2 mt-2 flex justify-end">
              <button
                type="button"
                className="h-10 rounded-full bg-[var(--color-brand-fill)] px-6 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-fill-hover)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-tertiary)]"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}