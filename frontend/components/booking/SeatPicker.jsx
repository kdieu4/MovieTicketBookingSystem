"use client";

import { Skeleton } from '@/components/common/Ascii';

export const SEAT_ANIMATIONS = `
@keyframes sp-seat-in {
  from { opacity: 0; transform: translateY(8px) scale(0.85); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes sp-pop {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.18); }
  100% { transform: scale(1); }
}
@keyframes sp-draw {
  from { stroke-dashoffset: 1; opacity: 0.2; }
  to { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes sp-fade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.sp-seat-in { animation: sp-seat-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.sp-pop { animation: sp-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.sp-screen-draw { stroke-dasharray: 1; animation: sp-draw 900ms ease-out both; }
.sp-fade { animation: sp-fade 400ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .sp-seat-in, .sp-pop, .sp-screen-draw, .sp-fade { animation: none !important; }
}
`;

export default function SeatPicker({ loadingSeats, seatsByRow, selectedSeats, onToggleSeat }) {
  if (loadingSeats) {
    return (
      <div role="status" aria-live="polite">
        <Skeleton rows={1} width="100%" height={6} className="mx-auto mb-10 max-w-xl rounded-full" />
        <div className="overflow-x-auto pb-2">
          <div className="mx-auto flex min-w-[500px] flex-col items-center gap-3">
            {Array.from({ length: 6 }).map((_, row) => (
              <Skeleton
                key={row}
                rows={2}
                width={388}
                height={36}
                seed={row}
                className="rounded-[var(--radius-sm)]"
              />
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-[13px] text-[var(--color-text-secondary)]">
          Đang tải danh sách ghế...
        </p>
      </div>
    );
  }

  return (
    <div>
      <style>{SEAT_ANIMATIONS}</style>

      <div className="relative mx-auto mb-10 w-full max-w-xl text-center">
        <svg viewBox="0 0 500 30" className="w-full">
          <path
            d="M 10 25 Q 250 2 490 25"
            pathLength="1"
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            className="sp-screen-draw drop-shadow-[0_2px_8px_var(--color-brand-primary)]"
          />
        </svg>
        <span
          className="sp-fade mt-1 block text-[11px] font-semibold tracking-[0.25em] text-[var(--color-text-tertiary)] uppercase"
          style={{ animationDelay: '300ms' }}
        >
          MÀN HÌNH
        </span>
      </div>

      <div className="overflow-x-auto pb-4 pt-3">
        <div className="mx-auto flex w-max flex-col items-center gap-3">
          {seatsByRow.map(([rowLabel, rowSeats], rowIndex) => {
            // FIX LỖI NHÂN ĐÔI GHẾ: Lọc loại bỏ các object ghế bị trùng số (number) trong cùng một hàng
            const uniqueSeats = Array.from(new Map(rowSeats.map(seat => [seat.number, seat])).values());

            return (
              <div key={rowLabel} className="flex items-center gap-3">
                <span
                  className="sp-fade w-5 text-center text-[12px] font-semibold text-[var(--color-text-secondary)]"
                  style={{ animationDelay: `${rowIndex * 45}ms` }}
                >
                  {rowLabel}
                </span>
                <div className="flex items-center gap-2">
                  {uniqueSeats.map((seat, seatIndex) => {
                    const isSelected = selectedSeats.some((s) => s.id === seat.id);
                    const isSold = seat.isSold;
                    const isVip = seat.type === 'VIP';
                    const isDouble = seat.type === 'DOUBLE' || seat.type === 'SWEETBOX' || seat.type === 'COUPLE';

                    let seatClass =
                      'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border-[var(--color-border-separator)] hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-fill-tertiary)]';

                    if (isSold) {
                      seatClass =
                        'bg-[var(--color-fill-tertiary)] text-[var(--color-text-quaternary)] border-transparent cursor-not-allowed';
                    } else if (isSelected) {
                      seatClass =
                        'sp-pop bg-[var(--color-brand-fill)] text-[var(--color-brand-on-primary)] border-[var(--color-brand-primary)] font-semibold shadow-[var(--shadow-low)]';
                    } else if (isVip) {
                      seatClass =
                        'bg-[var(--color-bg-primary)] border-[var(--color-system-warning)] text-[var(--color-system-warning)] font-semibold hover:bg-[var(--color-fill-tertiary)]';
                    } else if (isDouble) {
                      seatClass =
                        'bg-[var(--color-bg-primary)] border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] font-semibold hover:bg-[var(--color-fill-tertiary)]';
                    }

                    const seatLabel = `${seat.row ?? rowLabel}${String(seat.number).padStart(2, '0')}`;

                    return (
                      <span
                        key={seat.id}
                        className="sp-seat-in inline-flex"
                        style={{ animationDelay: `${Math.min(rowIndex * 45 + seatIndex * 14, 700)}ms` }}
                      >
                        <button
                          type="button"
                          disabled={isSold}
                          aria-pressed={isSelected}
                          aria-label={isSold ? `Ghế ${seatLabel} đã bán` : `Ghế ${seatLabel}`}
                          onClick={() => onToggleSeat(seat)}
                          className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border text-[11px] transition-all duration-200 ease-out ${
                            isSold ? '' : 'hover:scale-110 active:scale-90'
                          } ${seatClass}`}
                        >
                          {String(seat.number).padStart(2, '0')}
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="sp-fade mt-8 flex flex-wrap items-center justify-center gap-5 border-t border-[var(--color-border-separator)] pt-5 text-[12px] text-[var(--color-text-secondary)]"
        style={{ animationDelay: '500ms' }}
      >
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[var(--radius-xs)] border border-[var(--color-border-separator)] bg-[var(--color-bg-primary)]" />
          <span>Trống</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[var(--radius-xs)] border border-[var(--color-system-warning)] bg-[var(--color-bg-primary)]" />
          <span>Ghế VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[var(--radius-xs)] border border-[var(--color-brand-primary)] bg-[var(--color-bg-primary)]" />
          <span>Ghế đôi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[var(--radius-xs)] bg-[var(--color-brand-fill)]" />
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
          <span>Đã bán</span>
        </div>
      </div>

      <p className="mt-5 text-center text-[12px] text-[var(--color-text-tertiary)]">
        Chọn ghế trống để tiếp tục. Ghế được chọn sẽ hiển thị màu nhấn thương hiệu.
      </p>
    </div>
  );
}