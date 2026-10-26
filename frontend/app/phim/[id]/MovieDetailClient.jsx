"use client";

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/common/Badge';
import BookingFlow from '@/components/booking/BookingFlow';
import TrailerModal from '@/components/movie/TrailerModal';
import { IconArrowLeft, IconClock, IconCalendar, IconPlay } from '@/components/common/Icons';
import { Reveal } from '@/components/common/Ascii';
import { AGE_LABEL, STATUS_LABEL, formatDuration } from '@/utils/movieHelpers';
import '@/styles/booking-motion.css';

// Khóa lưu dữ liệu đặt vé để trang thanh toán đọc lại
const CHECKOUT_KEY = 'mtbs-checkout';

export default function MovieDetailClient({ movie }) {
  const router = useRouter();
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // BookingFlow đặt lại toàn bộ khi filters đổi tham chiếu, nên bắt buộc phải memo.
  // Phải khai báo trước các return sớm bên dưới.
  const movieTitle = movie?.title;
  const bookingFilters = useMemo(() => (movieTitle ? { movieTitle } : null), [movieTitle]);

  // Bấm Tiếp tục ở bước chọn ghế: lưu lựa chọn rồi sang trang thanh toán
  const handleContinue = useCallback(
    (payload) => {
      try {
        window.sessionStorage.setItem(
          CHECKOUT_KEY,
          JSON.stringify({
            movieTitle,
            showtime: payload.showtime,
            seats: payload.seats,
            total: payload.total,
            holdUntil: payload.holdUntil,
            city: payload.city,
            cinema: payload.cinema,
          })
        );
      } catch {
        // Trình duyệt chặn sessionStorage thì vẫn cho chuyển trang
      }
      router.push(`/dat-ve/${payload.showtime.id}`);
    },
    [router, movieTitle]
  );

  if (!movie) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)]">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-[16px] text-[var(--color-text-primary)]">Không tải được thông tin phim.</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full bg-[var(--color-brand-fill)] px-6 py-3 text-[14px] font-medium text-[var(--color-brand-on-primary)]"
          >
            Quay lại
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const genres = movie.genres ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />

      <Reveal lazy={false} className="flex-1">
      <div className="mx-auto max-w-6xl px-5 pt-6 md:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-all duration-200 hover:-translate-x-0.5 hover:text-[var(--color-text-primary)]"
        >
          <IconArrowLeft /> Quay lại
        </button>
      </div>

      <div className="relative mt-4 h-[180px] w-full overflow-hidden md:h-[240px]">
        {movie.posterUrl && (
          <Image
            src={movie.posterUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="scale-105 object-cover opacity-40 blur-[4px]"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 10%, var(--color-bg-primary) 100%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-5 pb-20 md:-mt-24 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <div className="relative aspect-[3/4] w-[150px] shrink-0 overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-high)] md:w-[200px]">
            {movie.posterUrl && (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                priority
                sizes="(max-width: 768px) 150px, 200px"
                className="object-cover"
              />
            )}
          </div>

          <div className="flex-1 pt-1 md:pt-4">
            {movie.status && <Badge tone="brand">{STATUS_LABEL[movie.status] ?? movie.status}</Badge>}

            <h1 className="mt-2 text-[26px] font-semibold leading-[1.2] text-[var(--color-text-primary)] md:text-[32px]">
              {movie.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[var(--color-text-secondary)]">
              {movie.durationMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <IconClock /> {formatDuration(movie.durationMinutes)}
                </span>
              )}
              {movie.releaseDate && (
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar /> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                </span>
              )}
              {movie.ageRestriction && <Badge>{AGE_LABEL[movie.ageRestriction] ?? movie.ageRestriction}</Badge>}
            </div>

            {genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {genres.map((g, index) => (
                  <Badge key={`${g}-${index}`}>{g}</Badge>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-col gap-1 text-[13px] text-[var(--color-text-secondary)]">
              {movie.director && (
                <p>
                  <span className="font-semibold text-[var(--color-text-primary)]">Đạo diễn: </span>
                  {movie.director}
                </p>
              )}
              {movie.actors && (
                <p>
                  <span className="font-semibold text-[var(--color-text-primary)]">Diễn viên: </span>
                  {movie.actors}
                </p>
              )}
            </div>

            {movie.description && (
              <p className="mt-3 max-w-[65ch] text-[14px] leading-[1.5] text-[var(--color-text-primary)]">
                {movie.description}
              </p>
            )}

            {movie.trailerUrl && (
              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border-opaque-separator)] px-4 py-2 text-[13px] font-medium text-[var(--color-text-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] active:scale-95"
              >
                <IconPlay /> Xem trailer
              </button>
            )}
          </div>
        </div>

        {/* Luồng đặt vé hiện thẳng trong trang: thành phố, rạp, suất chiếu rồi sơ đồ ghế */}
        <section className="mt-10 scroll-mt-24 md:mt-12">
          <h2 className="mb-4 text-[20px] font-semibold text-[var(--color-text-primary)]">Đặt vé</h2>

          <BookingFlow
            variant="inline"
            filters={bookingFilters}
            searchId={1}
            onContinue={handleContinue}
          />
        </section>
      </div>
      </Reveal>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        title={movie.title}
      />

      <Footer />
    </div>
  );
}
