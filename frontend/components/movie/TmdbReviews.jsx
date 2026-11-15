"use client";

import { useState } from 'react';
import { IconStar } from '@/components/common/Icons';

const PAGE_SIZE = 4;

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('vi-VN');
}

/** Review lấy từ TMDB, chỉ hiển thị ở trang chi tiết phim. */
export default function TmdbReviews({ reviews = [] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <section className="mt-10 md:mt-12" aria-labelledby="tmdb-reviews-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="tmdb-reviews-title" className="text-[20px] font-semibold text-[var(--color-text-primary)]">
          Review phim
        </h2>
        {reviews.length > 0 && (
          <span className="text-xs font-medium tabular-nums text-[var(--color-text-tertiary)]">
            {reviews.length} review
          </span>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-separator)] px-6 py-10 text-center text-sm text-[var(--color-text-secondary)]">
          Chưa có review nào trên TMDB cho phim này.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {visibleReviews.map((review, index) => {
            const createdOn = review.createdAt ? formatDate(review.createdAt) : null;

            return (
              <li key={review.url ?? index} className="surface flex flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-[var(--color-text-primary)]">
                    {review.author || 'Ẩn danh'}
                  </p>
                  {review.rating != null && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-fill-secondary)] px-2 py-1 text-[11px] font-semibold tabular-nums text-[var(--color-text-primary)]">
                      <IconStar className="h-3 w-3 text-[var(--color-brand-primary)]" />
                      {Number(review.rating).toFixed(1)}/10
                    </span>
                  )}
                </div>

                {createdOn && (
                  <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{createdOn}</p>
                )}

                <p className="mt-2 line-clamp-5 whitespace-pre-line text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  {review.content}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="btn btn-secondary"
          >
            Xem thêm review
          </button>
        </div>
      )}
    </section>
  );
}
