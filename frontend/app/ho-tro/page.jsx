"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const INITIAL_FORM = { name: '', email: '', message: '', website: '' };

const INPUT_CLASS =
  'mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] transition-colors duration-200 focus:border-[var(--color-brand-primary)] focus:outline-none disabled:opacity-60';

export default function SupportPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status !== 'sending' && status !== 'idle') setStatus('idle');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'sending') return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      website: form.website,
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('error');
      setErrorMessage('Vui lòng nhập đầy đủ họ tên, email và nội dung.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Không gửi được yêu cầu. Vui lòng thử lại.');
      }

      setForm(INITIAL_FORM);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Không gửi được yêu cầu. Vui lòng thử lại.');
    }
  }

  const isSending = status === 'sending';

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />

      <main className="animate-fade-in mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-[var(--color-fill-secondary)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
              Liên hệ 24/7
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Trung tâm hỗ trợ khách hàng</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 shadow-[var(--shadow-low)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary-container)] text-xs font-bold text-[var(--color-brand-primary)]">
                  TEL
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Hotline hỗ trợ (8:00 - 22:00)</p>
                  <p className="text-sm font-semibold">1900 6868</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 shadow-[var(--shadow-low)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary-container)] text-xs font-bold text-[var(--color-brand-primary)]">
                  MAIL
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Email hỗ trợ khách hàng</p>
                  <p className="text-sm font-semibold">support@seenema.vn</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-translucent-card)] p-6 shadow-[var(--shadow-medium)] backdrop-blur-xl sm:p-8">
            <h2 className="text-lg font-bold tracking-tight">Gửi yêu cầu hỗ trợ</h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="support-name" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Họ và tên
                </label>
                <input
                  id="support-name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={isSending}
                  placeholder="Nguyễn Văn A"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="support-email" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Email liên hệ
                </label>
                <input
                  id="support-email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isSending}
                  placeholder="example@gmail.com"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="support-message" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Nội dung cần hỗ trợ
                </label>
                <textarea
                  id="support-message"
                  name="message"
                  rows={4}
                  required
                  maxLength={3000}
                  value={form.message}
                  onChange={handleChange}
                  disabled={isSending}
                  placeholder="Mô tả chi tiết sự cố hoặc thắc mắc của bạn..."
                  className={`${INPUT_CLASS} resize-y`}
                />
              </div>

              {/* Trường chống bot: người dùng thật không nhìn thấy */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="support-website">Website</label>
                <input
                  id="support-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>

              <div
                role="status"
                aria-live="polite"
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                  status === 'success' || status === 'error' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm ${
                      status === 'success'
                        ? 'bg-[var(--color-brand-primary-container)] text-[var(--color-brand-primary)]'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {status === 'success'
                      ? 'Đã gửi yêu cầu. Chúng tôi sẽ phản hồi qua email của bạn trong thời gian sớm nhất.'
                      : errorMessage}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="h-11 w-full rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] text-sm font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-primary-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
              >
                {isSending ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}