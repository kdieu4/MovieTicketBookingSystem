"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Reveal } from '@/components/common/Ascii';

const ALL_CITIES = 'Tất cả';

export default function CinemasPage({ cinemas = [], error = false }) {
  const [city, setCity] = useState(ALL_CITIES);

  const cities = useMemo(() => {
    const unique = Array.from(new Set(cinemas.map((cinema) => cinema.city).filter(Boolean)));
    return [ALL_CITIES, ...unique.sort((a, b) => a.localeCompare(b, 'vi'))];
  }, [cinemas]);

  const visibleCinemas = city === ALL_CITIES ? cinemas : cinemas.filter((cinema) => cinema.city === city);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />

      <main className="animate-fade-in mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-[var(--color-fill-secondary)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
            Hệ thống rạp
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Rạp chiếu tại Seenema</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Chọn thành phố để xem danh sách rạp, địa chỉ và số điện thoại hỗ trợ.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-system-error)]/40 bg-[var(--color-system-error)]/10 px-4 py-3 text-sm font-medium text-[var(--color-system-error)]">
            Không tải được danh sách rạp. Vui lòng thử lại sau.
          </div>
        )}

        {cities.length > 1 && (
          <div className="mt-7 flex flex-wrap gap-2">
            {cities.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCity(item)}
                aria-pressed={city === item}
                className={`h-8 rounded-full px-3.5 text-xs font-medium transition-all active:scale-95 ${
                  city === item
                    ? 'bg-[var(--color-brand-fill)] font-semibold text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]'
                    : 'bg-[var(--color-fill-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {visibleCinemas.length > 0 ? (
          <>
            <p className="mt-6 text-xs font-medium text-[var(--color-text-tertiary)]">
              {visibleCinemas.length} rạp {city === ALL_CITIES ? 'trên toàn quốc' : `tại ${city}`}
            </p>

            <Reveal key={city} lazy={false} className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCinemas.map((cinema, index) => (
                <article
                  key={cinema.id}
                  data-ascii="surface"
                  style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                  className="animate-fade-in flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-5 shadow-[var(--shadow-low)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-opaque-separator)] hover:shadow-[var(--shadow-medium)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary-container)] text-sm font-semibold text-[var(--color-brand-primary)]">
                      {cinema.name?.charAt(0) ?? 'S'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold leading-snug text-[var(--color-text-primary)]">{cinema.name}</h2>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{cinema.city}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">{cinema.address}</p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-border-separator)] pt-4">
                    {cinema.phone ? (
                      <a
                        href={`tel:${cinema.phone}`}
                        className="text-xs font-semibold text-[var(--color-brand-primary)] transition-opacity hover:opacity-70"
                      >
                        {cinema.phone}
                      </a>
                    ) : (
                      <span />
                    )}
                    <Link
                      href="/#phim"
                      className="inline-flex h-8 items-center rounded-full bg-[var(--color-fill-secondary)] px-3.5 text-xs font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)] active:scale-95"
                    >
                      Xem phim
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            </Reveal>
          </>
        ) : (
          <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-separator)] px-6 py-14 text-center">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Chưa có rạp tại khu vực này.</p>
            <button
              type="button"
              onClick={() => setCity(ALL_CITIES)}
              className="mt-3 text-xs font-semibold text-[var(--color-brand-primary)] hover:underline"
            >
              Xem tất cả rạp
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
