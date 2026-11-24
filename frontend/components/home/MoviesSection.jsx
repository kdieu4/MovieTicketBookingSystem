"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MovieCard from '@/components/movie/MovieCard';
import { IconFilter } from '@/components/common/Icons';
import ShowMoreButton from '@/components/common/ShowMoreButton';
import Skeleton from '@/components/common/Skeleton';
import { usePagedGrid } from '@/utils/usePagedGrid';
import {
  MOVIE_PAGE_SIZE,
  fetchComingSoonMoviesPage,
  fetchNowShowingMoviesPage,
} from '@/services/movieApi';
import { GlassTabs } from '@/components/liquid-glass';

// 3 hàng đầu, mỗi lần bấm mở thêm 2 hàng; số cột do lưới thực tế quyết định.
const FIRST_ROWS = 3;
const STEP_ROWS = 2;

const TABS = [
  { id: 'showing', label: 'Đang chiếu' },
  { id: 'upcoming', label: 'Sắp chiếu' },
];

export default function MoviesSection({ onSelectShowtime }) {
  const [tab, setTab] = useState('showing');
  // Thể loại đang lọc, lưu theo genreId vì bộ lọc chạy ở server.
  const [selectedGenres, setSelectedGenres] = useState([]);

  const isShowing = tab === 'showing';
  const isAllSelected = selectedGenres.length === 0;

  const fetchPage = useCallback(
    (page, size) =>
      isShowing
        ? fetchNowShowingMoviesPage({ genreIds: selectedGenres, page, size })
        : fetchComingSoonMoviesPage({ page, size }),
    [isShowing, selectedGenres],
  );

  const grid = usePagedGrid({
    fetchPage,
    pageSize: MOVIE_PAGE_SIZE,
    initialRows: FIRST_ROWS,
    stepRows: STEP_ROWS,
  });
  const { reload } = grid;

  // Bộ lọc thể loại (genreId, tên, số phim) do server trả về theo từng trang.
  const genreOptions = grid.facets;

  // Tổng số phim đang chiếu, giữ lại khi đang lọc để chip "Tất cả" vẫn đúng.
  const [allShowingTotal, setAllShowingTotal] = useState(0);
  useEffect(() => {
    if (isShowing && isAllSelected && !grid.loading) {
      setAllShowingTotal(grid.total);
    }
  }, [isShowing, isAllSelected, grid.loading, grid.total]);

  function selectTab(id) {
    setTab(id);
    setSelectedGenres([]);
  }

  function handleSelectAll() {
    setSelectedGenres([]);
  }

  function handleToggleGenre(genreId) {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId],
    );
  }

  // Đổi tab hoặc đổi bộ lọc thì tải lại từ trang đầu (bỏ qua lần chạy đầu tiên,
  // vì hook đã tự tải trang 0).
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    reload();
  }, [tab, selectedGenres, reload]);

  const movies = grid.items;

  return (
    <section id="phim" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div>
        <h2 className="section-title">Phim</h2>
      </div>

      {/* Tab chuyển giữa phim đang chiếu và sắp chiếu */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <GlassTabs
          aria-label="Danh sách phim"
          value={tab}
          onValueChange={selectTab}
          options={TABS.map(({ id, label }) => ({ value: id, label }))}
        />
      </div>

      {isShowing ? (
        <div
          key="showing"
          id="phim-panel-showing"
          role="tabpanel"
          aria-labelledby="phim-tab-showing"
          className="animate-fade-in"
        >
          {/* Bộ lọc thể loại cho phim đang chiếu */}
          {genreOptions.length > 0 && (
            <div className="mt-7 border-t border-[var(--color-border-separator)] pt-4">
              <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <IconFilter className="h-4 w-4 shrink-0" />
                  <span id="now-showing-genre-label" className="text-xs font-semibold">
                    Lọc theo thể loại
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    aria-live="polite"
                    className="px-1 text-xs font-medium tabular-nums text-[var(--color-text-tertiary)]"
                  >
                    {grid.loading ? 'Đang tải phim…' : `${grid.total} phim`}
                  </span>
                  {!isAllSelected && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="inline-flex h-11 items-center rounded-full px-3 text-xs font-semibold text-[var(--color-brand-primary)] transition-colors duration-200 hover:bg-[var(--color-fill-secondary)]"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>
              </div>

              <div
                role="group"
                aria-labelledby="now-showing-genre-label"
                className="mt-3 flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  onClick={handleSelectAll}
                  data-active={isAllSelected}
                  aria-pressed={isAllSelected}
                  className="chip"
                >
                  Tất cả
                  <span className="chip-count">{isAllSelected ? grid.total : allShowingTotal}</span>
                </button>

                {genreOptions.map(({ id, name, count }) => {
                  const isSelected = selectedGenres.includes(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleToggleGenre(id)}
                      data-active={isSelected}
                      aria-pressed={isSelected}
                      className="chip"
                    >
                      {name}
                      <span className="chip-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div
            ref={grid.gridRef}
            className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5"
          >
            {grid.loading && movies.length === 0
              ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
              : movies.slice(0, grid.visibleCount).map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={index}
                    onSelectShowtime={onSelectShowtime}
                  />
                ))}
          </div>

          {!grid.loading && movies.length === 0 && (
            <div className="animate-fade-in mt-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-separator)] px-6 py-12 text-center">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {isAllSelected ? 'Hiện chưa có phim đang chiếu.' : 'Không có phim thuộc thể loại đã chọn.'}
              </p>
              {!isAllSelected && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="mt-3 inline-flex h-11 items-center px-2 text-xs font-semibold text-[var(--color-brand-primary)] hover:underline"
                >
                  Hiển thị lại tất cả phim
                </button>
              )}
            </div>
          )}

          {!grid.loading && grid.canShowMore && (
            <ShowMoreButton onClick={grid.showMore} />
          )}
        </div>
      ) : (
        <div
          key="upcoming"
          id="phim-panel-upcoming"
          role="tabpanel"
          aria-labelledby="phim-tab-upcoming"
          className="animate-fade-in mt-8"
        >
          {grid.loading && movies.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`coming-soon-skeleton-${i}`} className="surface flex items-center gap-4 p-4">
                  <Skeleton width={64} height={96} className="shrink-0 rounded-[10px]" />
                  <div className="flex-1">
                    <Skeleton lines={2} widths={['78%', '46%']} />
                  </div>
                </div>
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-separator)] px-6 py-12 text-center">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Hiện chưa có phim sắp chiếu.
              </p>
            </div>
          ) : (
            <ul ref={grid.gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {movies.slice(0, grid.visibleCount).map((movie, index) => (
                <li
                  key={movie.id ?? `coming-soon-${index}`}
                  style={{ animationDelay: `${Math.min(index * 55, 330)}ms`, animationFillMode: 'both' }}
                >
                  <Link
                    href={`/phim/${movie.id}`}
                    className="animate-fade-in group surface flex items-center gap-4 p-4 transition-[transform,border-color] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[var(--color-border-opaque-separator)]"
                  >
                    <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-[10px] bg-[var(--color-fill-tertiary)]">
                      {movie.posterUrl && (
                        <Image
                          src={movie.posterUrl}
                          alt={`Poster phim ${movie.title}`}
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                        {movie.title}
                      </p>
                      {movie.releaseDate && (
                        <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                          Khởi chiếu {formatDate(movie.releaseDate)}
                        </p>
                      )}
                      <span className="mt-3 inline-flex h-6 items-center rounded-full bg-[var(--color-brand-primary-container)] px-2.5 text-[11px] font-semibold text-[var(--color-brand-on-primary-container)]">
                        Sắp chiếu
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!grid.loading && grid.canShowMore && movies.length > 0 && (
            <ShowMoreButton onClick={grid.showMore} />
          )}
        </div>
      )}
    </section>
  );
}

function CardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/3] w-full rounded-[18px]" />
      <Skeleton lines={2} widths={['78%', '46%']} className="mt-3" />
    </div>
  );
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
