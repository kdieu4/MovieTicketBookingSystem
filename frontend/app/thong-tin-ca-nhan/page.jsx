"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const INPUT_OK =
  'mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3.5 text-sm text-[var(--color-text-primary)] transition-[border-color,box-shadow] duration-200 focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:cursor-not-allowed disabled:bg-[var(--color-fill-tertiary)] disabled:text-[var(--color-text-secondary)]';

// Lấy chữ cái đầu của họ tên để làm avatar, ví dụ "Hieu Love You" -> "HL"
function initialsOf(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  // status: 'loading' | 'ready' | 'unauth' | 'error'
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null); // { tone: 'success' | 'error', text }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });

        if (res.status === 401) {
          if (alive) setStatus('unauth');
          return;
        }

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(body.message || 'Không tải được hồ sơ người dùng.');
        }

        if (!alive) return;

        setProfile(body);
        setForm({ fullName: body.fullName ?? '', phoneNumber: body.phoneNumber ?? '' });
        setStatus('ready');
      } catch (err) {
        if (!alive) return;
        setError(err.message);
        setStatus('error');
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    if (saving) return;

    setNotice(null);
    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim(),
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.message || 'Không lưu được thay đổi.');
      }

      setProfile(body);
      setForm({ fullName: body.fullName ?? '', phoneNumber: body.phoneNumber ?? '' });
      setNotice({ tone: 'success', text: 'Đã lưu thay đổi.' });
    } catch (err) {
      setNotice({ tone: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      {/* justify-center: nội dung ngắn nên căn giữa phần trống giữa header và footer. */}
      <main className="animate-fade-in mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        {status === 'loading' && (
          <div
            aria-hidden="true"
            className="rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-medium)]"
          >
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 animate-pulse rounded-full bg-[var(--color-fill-tertiary)]" />
              <div className="h-6 w-40 animate-pulse rounded-full bg-[var(--color-fill-tertiary)]" />
            </div>
          </div>
        )}

        {status === 'unauth' && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-8 text-center shadow-[var(--shadow-medium)]">
            <h1 className="text-xl font-semibold tracking-tight">Bạn chưa đăng nhập</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Đăng nhập để xem thông tin tài khoản của bạn.
            </p>
            <Link
              href="/dang-nhap"
              className="mt-5 inline-flex h-10 items-center rounded-full bg-[var(--color-brand-fill)] px-6 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-fill-hover)] active:scale-95"
            >
              Đăng nhập
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-8 text-center shadow-[var(--shadow-medium)]">
            <h1 className="text-xl font-semibold tracking-tight">Không tải được hồ sơ</h1>
            <p className="mt-2 text-sm text-[var(--color-system-error)]">{error}</p>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="flex items-center gap-5 rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-medium)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-fill)] text-xl font-semibold text-[var(--color-brand-on-primary)]">
                {initialsOf(profile?.fullName)}
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{profile?.fullName}</h1>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{profile?.email}</p>
              </div>
            </div>

            <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-low)]">
              <h2 className="text-base font-semibold">Thông tin tài khoản</h2>

              <form onSubmit={handleSave} className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    Họ và tên
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className={INPUT_OK}
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-phone"
                    className="block text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    Số điện thoại
                  </label>
                  <input
                    id="profile-phone"
                    type="text"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className={INPUT_OK}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="profile-email"
                    className="block text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    disabled
                    value={profile?.email ?? ''}
                    className={INPUT_OK}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-4 sm:col-span-2">
                  <p
                    role={notice?.tone === 'error' ? 'alert' : 'status'}
                    aria-live="polite"
                    className={`text-xs ${
                      notice?.tone === 'error'
                        ? 'text-[var(--color-system-error)]'
                        : 'text-[var(--color-system-success)]'
                    }`}
                  >
                    {notice?.text ?? ''}
                  </p>

                  <button
                    type="submit"
                    disabled={saving}
                    className="h-10 shrink-0 rounded-full bg-[var(--color-brand-fill)] px-6 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-fill-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-tertiary)]"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
