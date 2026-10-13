import { useState } from 'react';

export default function HeroSection({ featuredMovie, cities = ['Hà Nội'], movieTitles = [] }) {
  const [city, setCity] = useState(cities[0] ?? '');
  const [showDate, setShowDate] = useState('');
  const [movieFilter, setMovieFilter] = useState('');

  function handleFindShowtimes(event) {
    event.preventDefault();
  }

  if (!featuredMovie) {
    return (
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-56 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-fill-tertiary)]" />
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
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-gradient-to-br from-[var(--color-brand-primary)] via-[var(--color-brand-primary-hover)] to-[var(--color-bg-tertiary)] shadow-[var(--shadow-medium)]">
        <CitySkylineArt />

        <div className="relative z-10 grid gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-[var(--color-brand-on-primary)]/15 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-brand-on-primary)] backdrop-blur-md">
              Phim nổi bật
            </span>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[var(--color-brand-on-primary)] sm:text-4xl">
              {featuredMovie.title}
            </h1>
            {metaLine && (
              <p className="mt-2.5 text-sm font-medium text-[var(--color-brand-on-primary)] opacity-90">{metaLine}</p>
            )}
            {featuredMovie.description && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-brand-on-primary)] opacity-80 line-clamp-3">
                {featuredMovie.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={featuredMovie.bookingUrl ?? '#'}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] px-6 text-sm font-semibold text-[var(--color-text-primary)] shadow-[var(--shadow-low)] transition-transform hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-on-primary)]"
              >
                Đặt vé ngay
              </a>
              {featuredMovie.trailerUrl && (
                <a
                  href={featuredMovie.trailerUrl}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-brand-on-primary)]/50 bg-[var(--color-brand-on-primary)]/10 px-6 text-sm font-semibold text-[var(--color-brand-on-primary)] backdrop-blur-md transition-colors hover:bg-[var(--color-brand-on-primary)]/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-on-primary)]"
                >
                  Xem trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Form tìm kiếm suất chiếu mờ kính chuẩn Apple */}
        <form
          onSubmit={handleFindShowtimes}
          className="relative z-10 mx-4 mb-4 grid gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-translucent-card)] p-4 backdrop-blur-xl sm:mx-8 sm:mb-8 sm:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <Field label="Khu vực">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-[var(--color-text-primary)] focus:outline-none"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]">
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
              className="w-full bg-transparent text-sm font-medium text-[var(--color-text-primary)] focus:outline-none"
            />
          </Field>

          <Field label="Phim (tuỳ chọn)">
            <select
              value={movieFilter}
              onChange={(e) => setMovieFilter(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-[var(--color-text-primary)] focus:outline-none"
            >
              <option value="" className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]">Tất cả phim</option>
              {movieTitles.map((title) => (
                <option key={title} value={title} className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]">
                  {title}
                </option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            className="flex h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] px-5 text-sm font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-primary-hover)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
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
      <span className="block text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">{label}</span>
      <span className="mt-1 flex h-10 items-center rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3">
        {children}
      </span>
    </label>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CitySkylineArt() {
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-60 sm:block"
      viewBox="0 0 400 240"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
    >
      <circle cx="300" cy="70" r="70" fill="var(--color-brand-on-primary)" opacity="0.15" />
      <circle cx="300" cy="70" r="40" fill="var(--color-brand-on-primary)" opacity="0.25" />
      <g fill="rgba(0,0,0,0.25)">
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