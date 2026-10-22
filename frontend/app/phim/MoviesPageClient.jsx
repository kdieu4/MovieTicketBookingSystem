"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MovieCard from '@/components/movie/MovieCard';

const PAGE_SIZE = 15;

const TABS = [
  { id: 'showing', label: 'Đang chiếu' },
  { id: 'upcoming', label: 'Sắp chiếu' },
];

function normalize(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function matchesQuery(movie, query) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = normalize(`${movie.title} ${movie.director ?? ''} ${movie.genres?.join(' ') ?? ''}`);
  return tokens.every((token) => haystack.includes(token));
}

export function MoviesPage({ nowShowing, comingSoon, genres, error }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MoviesContent
        nowShowing={nowShowing}
        comingSoon={comingSoon}
        genres={genres}
        initialError={error}
      />
    </Suspense>
  );
}

function MoviesContent({ nowShowing, comingSoon, genres, initialError }) {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();

  const [tab, setTab] = useState('showing');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tab, query, selectedGenres]);

  const source = tab === 'showing' ? nowShowing : comingSoon;

  const filteredMovies = useMemo(() => {
    return source
      .filter((movie) => matchesQuery(movie, query))
      .filter((movie) => selectedGenres.length === 0 || selectedGenres.some((genre) => movie.genres?.includes(genre)));
  }, [source, query, selectedGenres]);

  const visibleMovies = filteredMovies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMovies.length;
  const otherTabCount = (tab === 'showing' ? comingSoon : nowShowing).filter((movie) => matchesQuery(movie, query)).length;

  function toggleGenre(name) {
    setSelectedGenres((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  }

  function resetFilters() {
    setSelectedGenres([]);
    setTab('showing');
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />

      <main className="animate-fade-in mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-[var(--color-fill-secondary)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
            Thư viện phim
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {query ? 'Kết quả tìm kiếm' : 'Tất cả phim'}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {query
              ? `Các phim phù hợp với “${query}” tại Seenema.`
              : 'Khám phá phim đang chiếu và sắp ra mắt, lọc nhanh theo thể loại bạn thích.'}
          </p>
        </div>

        {query && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary-container)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-on-primary-container)]">
            <span>Từ khóa: {query}</span>
            <Link href="/phim" className="transition-opacity hover:opacity-70" aria-label="Xóa từ khóa tìm kiếm">
              ✕
            </Link>
          </div>
        )}

        {initialError && (
          <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-system-error)]/40 bg-[var(--color-system-error)]/10 px-4 py-3 text-sm font-medium text-[var(--color-system-error)]">
            Không tải được danh sách phim. Vui lòng thử lại sau.
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={`h-9 rounded-full px-4 text-xs font-semibold transition-all active:scale-95 ${
                tab === item.id
                  ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]'
                  : 'border border-[var(--color-border-separator)] text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-auto text-xs font-medium text-[var(--color-text-tertiary)]">
            {filteredMovies.length} phim
          </span>
        </div>

        {genres.length > 0 && (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 shadow-[var(--shadow-low)]">
            <div className="mb-3 flex items-center justify-between border-b border-[var(--color-border-separator)] pb-2 text-xs font-semibold text-[var(--color-text-secondary)]">
              <span>Lọc theo thể loại</span>
              {selectedGenres.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedGenres([])}
                  className="text-[var(--color-brand-primary)] transition-opacity hover:opacity-70"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <GenreChip active={selectedGenres.length === 0} onClick={() => setSelectedGenres([])}>
                Tất cả
              </GenreChip>
              {genres.map((genre) => (
                <GenreChip
                  key={genre.id}
                  active={selectedGenres.includes(genre.name)}
                  onClick={() => toggleGenre(genre.name)}
                >
                  {genre.name}
                </GenreChip>
              ))}
            </div>
          </div>
        )}

        {visibleMovies.length > 0 ? (
          <>
            <div key={`${tab}-${query}-${selectedGenres.join('|')}`} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
              {visibleMovies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="h-9 rounded-full border border-[var(--color-border-separator)] px-6 text-xs font-semibold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-fill-tertiary)] active:scale-95"
                >
                  Xem thêm phim
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-separator)] px-6 py-14 text-center">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {query ? `Không tìm thấy phim phù hợp với “${query}”.` : 'Chưa có phim trong mục này.'}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Thử từ khóa khác hoặc chuyển sang danh sách {tab === 'showing' ? 'phim sắp chiếu' : 'phim đang chiếu'}.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {otherTabCount > 0 && (
                <button
                  type="button"
                  onClick={() => setTab(tab === 'showing' ? 'upcoming' : 'showing')}
                  className="h-9 rounded-full bg-[var(--color-brand-primary)] px-5 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-primary-hover)] active:scale-95"
                >
                  Xem {otherTabCount} phim {tab === 'showing' ? 'sắp chiếu' : 'đang chiếu'}
                </button>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="h-9 rounded-full border border-[var(--color-border-separator)] px-5 text-xs font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)] active:scale-95"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function GenreChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-all active:scale-95 ${
        active
          ? 'bg-[var(--color-brand-primary)] font-semibold text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]'
          : 'bg-[var(--color-fill-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}

function PageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-fill-tertiary)]" />
        <div className="mt-4 h-9 w-56 animate-pulse rounded bg-[var(--color-fill-tertiary)]" />
        <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded bg-[var(--color-fill-tertiary)]" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-fill-tertiary)]" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
