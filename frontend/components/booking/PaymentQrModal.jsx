"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";

const TIME_ZONE = "Asia/Ho_Chi_Minh";

function formatVND(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatDateTime(value) {
  if (!value) return "Chưa xác định";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa xác định";
  }

  return date.toLocaleString("vi-VN", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function seatName(seat) {
  return `${seat.row}${String(seat.number).padStart(2, "0")}`;
}

function formatRemaining(seconds) {
  if (seconds === null) return "--:--";

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(
    2,
    "0",
  )}`;
}

export default function PaymentQrModal({
  open,
  onClose,
  showtime,
  cinema,
  seats = [],
  total = 0,
  holdUntil,
  payment = null,
  loading = false,
  error = "",
  onCreateQr,
}) {
  const dialogRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(null);

  // Chỉ sử dụng Portal sau khi component được mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mở dialog bằng API gốc của trình duyệt
  useEffect(() => {
    if (!mounted || !open) return;

    const dialog = dialogRef.current;

    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [mounted, open]);

  // Đồng hồ đếm ngược thời gian giữ ghế
  useEffect(() => {
    if (!open) return;

    const expiresAt = new Date(holdUntil).getTime();

    if (!holdUntil || Number.isNaN(expiresAt)) {
      setRemaining(null);
      return;
    }

    function updateTime() {
      const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

      setRemaining(seconds);
    }

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [open, holdUntil]);

  if (!mounted || !open || !showtime) {
    return null;
  }

  const expired = remaining === 0;
  const qrValue = payment?.qrCodeUrl || null;
  const payUrl = payment?.payUrl || null;
  const hasPayment = Boolean(qrValue || payUrl);

  let safePayUrl = null;

  if (payUrl) {
    try {
      const url = new URL(payUrl);

      if (
        url.protocol === "https:" &&
        ["test-payment.momo.vn", "payment.momo.vn"].includes(url.hostname)
      ) {
        safePayUrl = url.toString();
      }
    } catch {
      // Không mở URL không hợp lệ
    }
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="seenema-payment-title"
      aria-describedby="seenema-payment-description"
      className="
        seenema-payment-dialog
        fixed left-1/2 top-1/2
        m-0 w-[calc(100%-24px)] max-w-[920px]
        -translate-x-1/2 -translate-y-1/2
        overflow-hidden
        rounded-[var(--radius-lg)]
        border border-[var(--color-border-opaque-separator)]
        bg-[var(--color-bg-primary)]
        p-0 text-[var(--color-text-primary)]
        shadow-[var(--shadow-high)]
      "
    >
      <div className="relative grid max-h-[90vh] overflow-y-auto md:grid-cols-[1.15fr_1fr]">
        {/* CỘT TRÁI: THÔNG TIN VÉ */}
        <section className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span
              className="
                rounded-[var(--radius-xs)]
                bg-[var(--color-system-error)]
                px-2 py-1 text-[11px] font-semibold
                text-[var(--color-brand-on-primary)]
              "
            >
              {showtime.ageRating || "PHIM"}
            </span>

            <h2
              id="seenema-payment-title"
              className="text-[20px] font-semibold"
            >
              {showtime.movieTitle}
            </h2>
          </div>

          <div
            className="
              grid grid-cols-2 gap-5
              border-y border-[var(--color-border-separator)]
              py-6
            "
          >
            <div>
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                THỜI GIAN / NGÀY CHIẾU
              </p>

              <p className="mt-1 text-[14px] font-semibold">
                {formatDateTime(showtime.startTime)}
              </p>
            </div>

            <div>
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                PHÒNG CHIẾU
              </p>

              <p className="mt-1 text-[14px] font-semibold">
                {showtime.room || "Đang cập nhật"}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                RẠP CHIẾU
              </p>

              <p className="mt-1 text-[15px] font-semibold">
                {cinema || showtime.cinemaName}
              </p>
            </div>

            <div>
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                ĐỊNH DẠNG
              </p>

              <p className="mt-1 text-[14px] font-semibold">
                {showtime.format || "Đang cập nhật"}
              </p>
            </div>

            <div>
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                SỐ GHẾ
              </p>

              <p className="mt-1 text-[14px] font-semibold">{seats.length}</p>
            </div>
          </div>

          {/* DANH SÁCH GHẾ */}
          <div className="border-b border-[var(--color-border-separator)] py-5">
            <p className="mb-3 text-[12px] font-semibold text-[var(--color-text-secondary)]">
              GHẾ ĐÃ CHỌN
            </p>

            <div className="flex flex-wrap gap-2">
              {seats.map((seat) => (
                <span
                  key={seat.id}
                  className="
                    rounded-[var(--radius-xs)]
                    border border-[var(--color-brand-primary)]
                    bg-[var(--color-brand-primary-container)]
                    px-3 py-1.5
                    text-[12px] font-semibold
                    text-[var(--color-brand-on-primary-container)]
                  "
                >
                  {seatName(seat)}
                </span>
              ))}
            </div>
          </div>

          {/* TỔNG TIỀN */}
          <div className="pt-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[15px] font-semibold">Tạm tính</span>

              <span className="text-[24px] font-semibold text-[var(--color-brand-primary)]">
                {formatVND(total)}
              </span>
            </div>

            <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              Giá thanh toán chính thức được xác nhận bởi Booking Service trước
              khi tạo giao dịch.
            </p>

            <p
              className={`mt-4 text-[13px] font-medium ${
                expired
                  ? "text-[var(--color-system-error)]"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              Thời gian giữ ghế còn lại:{" "}
              <span className="font-semibold tabular-nums">
                {formatRemaining(remaining)}
              </span>
            </p>
          </div>
        </section>

        {/* CỘT PHẢI: THANH TOÁN QR */}
        <section
          className="
            relative flex flex-col items-center
            justify-center gap-5
            border-t border-[var(--color-border-separator)]
            bg-[var(--color-brand-primary-container)]
            p-6 text-center
            md:border-l md:border-t-0
            sm:p-8
          "
        >
          {/* Nút đóng */}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Đóng cửa sổ thanh toán"
            className="
              absolute right-4 top-4
              flex h-9 w-9 items-center justify-center
              rounded-[var(--radius-sm)]
              text-[var(--color-brand-on-primary-container)]
              transition-colors
              hover:bg-[var(--color-fill-secondary)]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[var(--color-brand-primary)]
            "
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>

          <div className="pt-8">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--color-brand-on-primary-container)]">
              Seenema Payment
            </p>

            <h3 className="mt-2 text-[20px] font-semibold text-[var(--color-text-primary)]">
              Thanh toán bằng MoMo
            </h3>

            <p
              id="seenema-payment-description"
              className="mt-2 text-[13px] text-[var(--color-text-secondary)]"
            >
              Sử dụng ứng dụng MoMo để quét mã QR.
            </p>
          </div>

          {/* KHUNG QR */}
          <div
            className="
              flex min-h-[260px] w-full max-w-[280px]
              flex-col items-center justify-center
              gap-4 rounded-[var(--radius-lg)]
              border border-[var(--color-border-separator)]
              bg-[var(--color-bg-tertiary)]
              p-5 text-[var(--color-text-primary)]
              shadow-[var(--shadow-low)]
            "
          >
            {qrValue && !expired ? (
              <QRCodeSVG
                value={qrValue}
                size={216}
                level="M"
                bgColor="transparent"
                fgColor="currentColor"
                title="Mã QR thanh toán MoMo"
              />
            ) : expired ? (
              <p className="text-[13px] text-[var(--color-system-error)]">
                Thời gian giữ ghế đã hết.
              </p>
            ) : loading ? (
              <div
                role="status"
                className="text-[13px] text-[var(--color-text-secondary)]"
              >
                Đang tạo mã thanh toán...
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-[var(--color-text-secondary)]">
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden="true"
                >
                  <path d="M4 25V4h21M47 4h21v21M68 47v21H47M25 68H4V47" />
                  <path d="M13 13h16v16H13zM43 13h16v16H43zM13 43h16v16H13z" />
                  <path d="M47 43v8h8M59 43v16M43 59h8" />
                </svg>

                <p className="text-[13px] leading-relaxed">
                  Mã QR sẽ xuất hiện sau khi tạo giao dịch thành công.
                </p>
              </div>
            )}
          </div>

          {/* TẠO GIAO DỊCH */}
          {!hasPayment && !expired && (
            <button
              type="button"
              onClick={onCreateQr}
              disabled={!onCreateQr || loading}
              className="
                flex h-[44px] w-full max-w-[280px]
                items-center justify-center
                rounded-[var(--radius-sm)]
                bg-[var(--color-brand-primary)]
                px-4 text-[13px] font-semibold
                text-[var(--color-brand-on-primary)]
                transition-colors
                hover:bg-[var(--color-brand-primary-hover)]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? "Đang tạo giao dịch..." : "Tạo mã QR thanh toán"}
            </button>
          )}

          {safePayUrl && !expired && (
            <a
              href={safePayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex h-[44px] w-full max-w-[280px]
                items-center justify-center
                rounded-[var(--radius-sm)]
                bg-[var(--color-brand-primary)]
                px-4 text-[13px] font-semibold
                text-[var(--color-brand-on-primary)]
              "
            >
              Mở trang thanh toán MoMo
            </a>
          )}

          {error && (
            <p
              role="alert"
              className="text-[12px] text-[var(--color-system-error)]"
            >
              {error}
            </p>
          )}

          {!onCreateQr && !hasPayment && (
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              Chế độ xem trước: chưa kết nối Booking Service và MoMo Sandbox.
            </p>
          )}

          <p className="max-w-[290px] text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
            Vui lòng kiểm tra thông tin vé và hoàn tất thanh toán trước khi thời
            gian giữ ghế kết thúc.
          </p>
        </section>
      </div>
    </dialog>,
    document.body,
  );
}
