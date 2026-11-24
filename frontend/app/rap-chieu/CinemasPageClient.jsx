"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ShowMoreButton from '@/components/common/ShowMoreButton';
import { Reveal } from '@/components/common/Ascii';
import { BrandGlassButton } from '@/components/common/BrandButton';
import { usePagedGrid } from '@/utils/usePagedGrid';
import { CINEMA_PAGE_SIZE, fetchCinemasPage } from '@/services/movieApi';

const ALL_CITIES = 'Tất cả';
// 3 hàng đầu, mỗi lần bấm mở thêm 2 hàng.
const FIRST_ROWS = 3;
const STEP_ROWS = 2;

export default function CinemasPage({ initialPage = null, cities: cityOptions = [], error = false }) {
  const [city, setCity] = useState(ALL_CITIES);

  const fetchPage = useCallback(
    (page, size) =>
      fetchCinemasPage({ city: city === ALL_CITIES ? undefined : city, page, size }),
    [city],
  );

  const grid = usePagedGrid({
    fetchPage,
    pageSize: CINEMA_PAGE_SIZE,
    initial: initialPage,
    initialRows: FIRST_ROWS,
    stepRows: STEP_ROWS,
  });
  const { reload } = grid;

  // Đổi thành phố thì hỏi lại server từ trang đầu (bỏ qua lần chạy đầu tiên).
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    reload();
  }, [city, reload]);

  const cities = [ALL_CITIES, ...cityOptions];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />

      <main className="animate-fade-in mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-[var(--color-fill-secondary)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
            Hệ thống rạp
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Rạp chiếu tại Seenema</h1>
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

        {grid.items.length > 0 ? (
          <>
            <p id="danh-sach-rap" className="mt-6 scroll-mt-24 text-xs font-medium text-[var(--color-text-tertiary)]">
              {grid.total} rạp {city === ALL_CITIES ? 'trên toàn quốc' : `tại ${city}`}
            </p>

            <Reveal key={city} lazy={false} className="mt-4">
            <div ref={grid.gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grid.items.slice(0, grid.visibleCount).map((cinema, index) => (
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
                    <BrandGlassButton
                      asChild
                      size="sm"
                      className="bg-[var(--color-brand-fill)] text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-fill-hover)]"
                      style={{ padding: '0 14px', fontSize: 12 }}
                    >
                      <Link href="/#phim">Xem phim</Link>
                    </BrandGlassButton>
                  </div>
                </article>
              ))}
            </div>
            </Reveal>

            {grid.canShowMore && (
              <ShowMoreButton onClick={grid.showMore} />
            )}
          </>
        ) : (
          <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-separator)] px-6 py-14 text-center">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {grid.loading ? 'Đang tải danh sách rạp…' : 'Chưa có rạp tại khu vực này.'}
            </p>
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
