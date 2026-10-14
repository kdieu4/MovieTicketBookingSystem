"use client";

import { IconWheelchair } from '@/components/common/Icons';

export default function SeatPicker({ loadingSeats, seatsByRow, selectedSeats, onToggleSeat }) {
  if (loadingSeats) {
    return (
      <div className="flex h-72 items-center justify-center text-[14px] text-[var(--color-text-secondary)]">
        Đang tải danh sách ghế...
      </div>
    );
  }

  return (
    <div>
      <div className="relative mx-auto mb-10 w-full max-w-xl text-center">
        <svg viewBox="0 0 500 30" className="w-full">
          <path
            d="M 10 25 Q 250 2 490 25"
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth="3"
            className="drop-shadow-[0_2px_8px_var(--color-brand-primary)]"
          />
        </svg>
        <span className="mt-1 block text-[11px] font-bold tracking-[0.25em] text-[var(--color-text-tertiary)] uppercase">
          MÀN HÌNH
        </span>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="mx-auto flex flex-col items-center gap-3 min-w-[500px]">
          {seatsByRow.map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className="flex items-center gap-3">
              <span className="w-5 text-center text-[12px] font-bold text-[var(--color-text-secondary)]">
                {rowLabel}
              </span>
              <div className="flex items-center gap-2">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeats.some((s) => s.id === seat.id);
                  const isSold = seat.isSold;
                  const isVip = seat.type === 'VIP';
                  const isDouble = seat.type === 'DOUBLE' || seat.type === 'SWEETBOX' || seat.type === 'COUPLE';
                  const isAccessible = seat.type === 'ACCESSIBLE';

                  let seatClass =
                    'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border-[var(--color-border-separator)] hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-fill-tertiary)]';

                  if (isSold) {
                    seatClass =
                      'bg-[var(--color-fill-tertiary)] text-[var(--color-text-quaternary)] border-transparent cursor-not-allowed';
                  } else if (isSelected) {
                    seatClass =
                      'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] border-[var(--color-brand-primary)] font-bold shadow-[var(--shadow-low)]';
                  } else if (isVip) {
                    seatClass =
                      'bg-[var(--color-bg-primary)] border-[var(--color-system-warning)] text-[var(--color-system-warning)] font-semibold hover:bg-[var(--color-fill-tertiary)]';
                  } else if (isDouble) {
                    seatClass =
                      'bg-[var(--color-bg-primary)] border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] font-semibold hover:bg-[var(--color-fill-tertiary)]';
                  } else if (isAccessible) {
                    seatClass =
                      'bg-[var(--color-bg-primary)] border-[var(--color-system-info)] text-[var(--color-system-info)] hover:bg-[var(--color-fill-tertiary)]';
                  }

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isSold}
                      onClick={() => onToggleSeat(seat)}
                      className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border text-[11px] transition-all ${seatClass}`}
                    >
                      {isAccessible && !isSelected ? (
                        <IconWheelchair />
                      ) : (
                        String(seat.number).padStart(2, '0')
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="w-5 text-center text-[12px] font-bold text-[var(--color-text-secondary)]">
                {rowLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-5 border-t border-[var(--color-border-separator)] pt-5 text-[12px] text-[var(--color-text-secondary)]">
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
          <span className="flex h-4 w-4 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--color-system-info)] bg-[var(--color-bg-primary)] text-[var(--color-system-info)]">
            <IconWheelchair />
          </span>
          <span>Ghế hỗ trợ tiếp cận</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)]" />
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