'use client';

import { useEffect, useRef, useState } from 'react';

// Banner thông báo thanh toán thành công trên /ve-cua-toi:
// - trượt xuống từ mép trên, có quầng sáng azure loé lên một nhịp;
// - giữ nguyên cho tới khi người dùng bấm ×, trong lúc đó quầng sáng nhấp nháy nhẹ
//   để thông báo không bị bỏ qua;
// - có poster + tên phim của vé vừa thanh toán.
// Chỉ đổi opacity/translate/scale nên không đụng transform của phần tử cha.
export default function PaymentSuccessBanner({
  title = 'Thanh toán thành công',
  movieTitle = '',
  posterUrl = '',
  detail = '',
  onDismiss,
}) {
  const [closing, setClosing] = useState(false);
  const closedRef = useRef(false);
  const dismissTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(dismissTimer.current), []);

  function handleDismiss() {
    if (closedRef.current) return;
    closedRef.current = true;
    setClosing(true);
    dismissTimer.current = window.setTimeout(() => onDismiss?.(), 260);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex justify-center px-4">
      <div className="relative isolate w-full max-w-[440px]">
        {/* Quầng sáng azure: loé lên khi banner vào, sau đó nhấp nháy cho tới khi tắt */}
        <span
          aria-hidden="true"
          className="pay-toast-glow pointer-events-none absolute inset-x-0 -top-6 -z-10 mx-auto h-28 w-[26rem] max-w-[130%] rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(closest-side, rgba(0, 127, 255, 0.9), rgba(0, 127, 255, 0.35) 55%, rgba(0, 127, 255, 0) 100%)',
          }}
        />
        {/* Quầng sáng lan: loé ngay dưới banner rồi loang rộng xuống dưới và mờ dần */}
        <span
          aria-hidden="true"
          className="pay-toast-glow-pulse pointer-events-none absolute inset-x-0 -top-3 -z-10 mx-auto h-24 w-[20rem] max-w-[115%] rounded-[50%] blur-2xl"
          style={{
            background:
              'radial-gradient(closest-side, rgba(0, 127, 255, 0.95), rgba(0, 127, 255, 0.38) 55%, rgba(0, 127, 255, 0) 100%)',
          }}
        />

        <div
          role="status"
          aria-live="polite"
          data-closing={closing ? '' : undefined}
          className="pay-toast pointer-events-auto flex items-center gap-3 rounded-[18px] bg-[#101828] py-2.5 pr-2.5 pl-2.5 text-white shadow-[0_18px_44px_-14px_rgba(6,12,24,0.6)]"
        >
          {/* Poster phim của vé vừa thanh toán + huy hiệu tick azure */}
          <span className="relative block h-[52px] w-[38px] shrink-0 overflow-hidden rounded-[9px] bg-white/10">
            {posterUrl ? (
              // Ảnh poster lấy từ TMDB; dùng thẻ img như danh sách vé để khỏi cấu hình next/image
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-white/40">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
                  <path d="M8 4.5v15M16 4.5v15M3 12h18" />
                </svg>
              </span>
            )}
            <span className="pay-toast-badge absolute -right-1 -bottom-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#007fff] text-white ring-2 ring-[#101828]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4.5 12.5l5 5 10-11" />
              </svg>
            </span>
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold">{title}</span>
            {movieTitle && (
              <span className="mt-0.5 block truncate text-[12px] font-medium text-white/85">{movieTitle}</span>
            )}
            {detail && <span className="mt-0.5 block truncate text-[11.5px] text-[#9aa4b2]">{detail}</span>}
          </span>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Đóng thông báo"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors duration-150 hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007fff]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
