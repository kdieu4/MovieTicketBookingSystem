import { useState } from 'react';

// featuredMovie: { title, genres, durationMinutes, ageRestriction, description, trailerUrl, bookingUrl }
// cities: danh sách khu vực lấy từ backend (ví dụ GET /api/cities hoặc danh sách rạp)
export default function HeroSection({ featuredMovie, cities = ['Hà Nội'], movieTitles = [] }) {
  const [city, setCity] = useState(cities[0] ?? '');
  const [showDate, setShowDate] = useState('');
  const [movieFilter, setMovieFilter] = useState('');

  function handleFindShowtimes(event) {
    event.preventDefault();
    // Điều hướng sang trang lịch chiếu, ví dụ:
    // navigate(`/suat-chieu?city=${city}&date=${showDate}&movie=${movieFilter}`)
  }

  if (!featuredMovie) {
    return (
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-48 animate-pulse rounded-2xl bg-[var(--color-fill-tertiary)]" />
      </section>
    );
  }

  const metaLine = [
    featuredMovie.genres?.join(', '),
    featuredMovie.durationMinutes ? `${featuredMovie.durationMinutes} phút` : null,
    featuredMovie.ageRestriction,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-separator)] bg-gradient-to-br from-[var(--color-brand-primary)] via-[var(--color-brand-primary-hover)] to-[var(--color-bg-tertiary)]">
        <CitySkylineArt />

        <div className="relative z-10 grid gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-wide text-[var(--color-brand-on-primary)] opacity-80">
              Phim nổi bật
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-[var(--color-brand-on-primary)] sm:text-4xl">
              {featuredMovie.title}
            </h1>
            {metaLine && (
              <p className="mt-3 text-sm text-[var(--color-brand-on-primary)] opacity-90">{metaLine}</p>
            )}
            {featuredMovie.description && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-brand-on-primary)] opacity-80">
                {featuredMovie.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={featuredMovie.bookingUrl ?? '#'}
                className="rounded-full bg-[var(--color-bg-tertiary)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-on-primary)]"
              >
                Đặt vé ngay
              </a>
              {featuredMovie.trailerUrl && (
                <a
                  href={featuredMovie.trailerUrl}
                  className="rounded-full border border-[var(--color-brand-on-primary)]/60 px-5 py-2.5 text-sm font-medium text-[var(--color-brand-on-primary)] transition-colors hover:border-[var(--color-brand-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-on-primary)]"
                >
                  Xem trailer
                </a>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleFindShowtimes}
          className="relative z-10 mx-6 mb-6 grid gap-3 rounded-xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 sm:mx-10 sm:mb-10 sm:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <Field label="Khu vực">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--color-text-primary)] focus:outline-none"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ngày xem">
            <input
              type="date"
              value={showDate}
              onChange={(e) => setShowDate(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--color-text-primary)] focus:outline-none"
            />
          </Field>

          <Field label="Phim (tuỳ chọn)">
            <select
              value={movieFilter}
              onChange={(e) => setMovieFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--color-text-primary)] focus:outline-none"
            >
              <option value="">Tất cả phim</option>
              {movieTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          >
            <SearchIcon />
            Tìm suất chiếu
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-[var(--color-text-secondary)]">{label}</span>
      <span className="mt-1 block rounded-lg border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3 py-2">
        {children}
      </span>
    </label>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Hoạ tiết trang trí: trăng + đường chân trời thành phố, chỉ mang tính minh hoạ.
// Dùng currentColor qua CSS variable nên tự đổi theo theme.
function CitySkylineArt() {
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-70 sm:block"
      viewBox="0 0 400 240"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
    >
      <circle cx="300" cy="70" r="70" fill="var(--color-brand-on-primary)" opacity="0.18" />
      <circle cx="300" cy="70" r="40" fill="var(--color-brand-on-primary)" opacity="0.28" />
      <g fill="rgba(0,0,0,0.3)">
        <rect x="150" y="140" width="24" height="100" />
        <rect x="190" y="110" width="20" height="130" />
        <rect x="225" y="160" width="18" height="80" />
        <rect x="255" y="90" width="22" height="150" />
        <rect x="290" y="150" width="20" height="90" />
        <rect x="325" y="120" width="24" height="120" />
        <rect x="360" y="170" width="18" height="70" />
      </g>
    </svg>
  );
}