"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { DistortionWave } from "distortion-waves";
import { Button } from "glisse";
import { clearPaymentSnapshot } from "@/utils/paymentSnapshot";

const TIME_ZONE = "Asia/Ho_Chi_Minh";

// Số giây chờ trên màn hình "Thanh toán thành công" trước khi tự mở trang vé.
const AUTO_LEAVE_SECONDS = 5;

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

function CloseIcon() {
  return (
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
  );
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
  inline = false,
  bookingId,
  showtime,
  cinema,
  seats = [],
  total = 0,
  holdUntil,
  payment = null,
  loading = false,
  error = "",
  onCreateQr,
  paid = false,
}) {
  const dialogRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(null);

  // Sau khi VNPay xác nhận thanh toán: nút đổi thành "Đang thanh toán",
  // đợi 1 giây cho người dùng kịp đọc rồi mới cho sóng distortion quét qua
  // và mang bảng thanh toán sang màn hình kết quả.
  const [paying, setPaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  // Sóng chạy xong thì bỏ hẳn lớp canvas, chỉ còn màn hình kết quả.
  const [finished, setFinished] = useState(false);
  // Đếm ngược trên màn hình kết quả trước khi tự mở trang vé.
  const [countdown, setCountdown] = useState(AUTO_LEAVE_SECONDS);
  const waveRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!paid) {
      setPaying(false);
      setRevealed(false);
      setFinished(false);
      setCountdown(AUTO_LEAVE_SECONDS);
      return;
    }

    setPaying(true);

    const timer = window.setTimeout(() => setRevealed(true), 1000);

    return () => window.clearTimeout(timer);
  }, [paid]);

  // Rời màn hình xác nhận, mở thẳng trang vé.
  const openMyTickets = useCallback(() => {
    clearPaymentSnapshot();
    router.push("/ve-cua-toi");
  }, [router]);

  // Bỏ lớp canvas khi sóng đã chạy xong: giữ lại canvas sẽ thấy ảnh cũ chồng
  // lên chữ của màn hình kết quả (các ô vuông mờ).
  const finishWave = useCallback(() => setFinished(true), []);

  // Dự phòng: nếu onFinish của sóng không chạy thì vẫn kết thúc hiệu ứng.
  useEffect(() => {
    if (!revealed) return;

    // Sóng mặc định chạy khoảng 2,7 giây.
    const settle = window.setTimeout(() => setFinished(true), 3200);

    return () => window.clearTimeout(settle);
  }, [revealed]);

  // Đếm ngược 5 giây trên màn hình kết quả, hết giờ thì tự mở trang vé.
  useEffect(() => {
    if (!finished) return;

    setCountdown(AUTO_LEAVE_SECONDS);
    const tick = window.setInterval(() => {
      setCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(tick);
  }, [finished]);

  useEffect(() => {
    if (!finished || countdown > 0) return;
    openMyTickets();
  }, [finished, countdown, openMyTickets]);

  // Chỉ sử dụng Portal sau khi component được mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mở dialog bằng API gốc của trình duyệt
  useEffect(() => {
    if (!mounted || !open || inline) return;

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
  }, [mounted, open, inline]);

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

  if (!open || !showtime) {
    return null;
  }

  if (!inline && !mounted) {
    return null;
  }

  // const expired = remaining === 0;
  // const qrValue = payment?.qrCodeUrl || null;
  // const payUrl = payment?.payUrl || null;
  // const hasPayment = Boolean(qrValue || payUrl);

  // let safePayUrl = null;

  // if (payUrl) {
  //   try {
  //     const url = new URL(payUrl);

  //     if (
  //       url.protocol === "https:" &&
  //       url.hostname === "sandbox.vnpayment.vn"
  //     ) {
  //       safePayUrl = url.toString();
  //     }
  //   } catch {
  //     // Không mở URL không hợp lệ
  //   }

  // const qrValue = safePayUrl;
  // const hasPayment = Boolean(safePayUrl);

  const expired = remaining === 0;
  const payUrl = payment?.payUrl || null;

  let safePayUrl = null;

  if (payUrl) {
    try {
      const url = new URL(payUrl);

      // Chỉ chấp nhận VNPay Sandbox
      if (
        url.protocol === "https:" &&
        url.hostname === "sandbox.vnpayment.vn"
      ) {
        safePayUrl = url.toString();
      }
    } catch {
      // URL không hợp lệ
    }
  }

  // QR chứa đường dẫn thanh toán VNPay
  const qrValue = safePayUrl;
  const hasPayment = Boolean(safePayUrl);

  // Đóng có animation ngắn (xem .seenema-payment-dialog[closing] trong globals.css)
  function requestClose() {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      dialog.close();
      return;
    }

    dialog.setAttribute('closing', '');
    window.setTimeout(() => {
      dialog.removeAttribute('closing');
      dialog.close();
    }, 140);
  }

  const payView = (
      <div className="relative grid max-h-[90vh] overflow-y-auto bg-[var(--color-bg-primary)] md:grid-cols-[1.15fr_1fr]">
        {/* CỘT TRÁI: THÔNG TIN VÉ */}
        <section className="p-6 sm:p-8">
          <div className="mb-4">
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              MÃ ĐẶT VÉ
            </p>
            <p className="mt-1 text-[15px] font-semibold text-[var(--color-brand-primary)]">
              {bookingId ? `#${bookingId}` : "Chưa tạo giao dịch"}
            </p>
          </div>
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
          {/* Nút đóng: chỉ dùng khi hiển thị dạng dialog */}
          {!inline && (
            <Button
              type="button"
              onClick={() => requestClose()}
              aria-label="Đóng cửa sổ thanh toán"
              className="absolute right-4 top-4"
              style={{ position: "absolute" }}
              icon={<CloseIcon />}
            />
          )}

          <div className="pt-8">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--color-brand-on-primary-container)]">
              Seenema Payment
            </p>

            <h3 className="mt-2 text-[20px] font-semibold text-[var(--color-text-primary)]">
              Thanh toán bằng VNPay
            </h3>
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
                title="Mã QR thanh toán VNPay"
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
          {paid ? (
            // Đang chờ hiệu ứng: giữ đúng kích thước nút cũ để bố cục không nhảy
            <button
              type="button"
              disabled
              aria-live="polite"
              className="lg-glass lg-button"
              data-variant="filled"
              style={{
                height: 44,
                width: "100%",
                maxWidth: 280,
                borderRadius: 22,
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "progress",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="animate-spin"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.2-8.6" />
              </svg>
              Đang thanh toán
            </button>
          ) : (
            <>
              {!hasPayment && !expired && (
                <Button
                  type="button"
                  variant="filled"
                  onClick={onCreateQr}
                  disabled={!onCreateQr || loading}
                  style={{ height: 44, width: "100%", maxWidth: 280, borderRadius: 22, fontSize: 13 }}
                >
                  {loading ? "Đang tạo giao dịch..." : "Tạo mã QR thanh toán"}
                </Button>
              )}

              {safePayUrl && !expired && (
                // Điều hướng ngay trong tab hiện tại: VNPay sẽ redirect về /payment/return
                // rồi trang đó tự chuyển tiếp sang màn hình xác nhận.
                <a
                  href={safePayUrl}
                  className="lg-glass lg-button"
                  data-variant="filled"
                  style={{ height: 44, width: "100%", maxWidth: 280, borderRadius: 22, fontSize: 13 }}
                >
                  Thanh toán qua VNPay
                </a>
              )}
            </>
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
              Chế độ xem trước: chưa kết nối Booking Service và VNPay Sandbox.
            </p>
          )}

          <p className="max-w-[290px] text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
            Vui lòng kiểm tra thông tin vé và hoàn tất thanh toán trước khi thời
            gian giữ ghế kết thúc.
          </p>
        </section>
      </div>
  );

  // Màn hình kết quả: sóng distortion mang bảng thanh toán sang đây
  const successView = (
    <div className="flex h-full min-h-[420px] w-full flex-col items-center justify-center gap-3 bg-[var(--color-bg-primary)] p-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-primary-container)] text-[var(--color-system-success)]">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4.5 12.5l5 5 10-11" />
        </svg>
      </span>

      <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
        Seenema Payment
      </p>

      <h2 className="text-[22px] font-semibold text-[var(--color-text-primary)]">
        Thanh toán thành công
      </h2>

      <p className="max-w-[320px] text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
        {showtime.movieTitle} · {seats.length} ghế · {formatVND(total)}
      </p>

      <p className="text-[12px] text-[var(--color-text-secondary)]">
        Mã đặt vé {bookingId ? `#${bookingId}` : "đang cập nhật"}
      </p>

      <a
        href="/"
        onClick={() => clearPaymentSnapshot()}
        className="lg-glass lg-button"
        data-variant="filled"
        style={{
          height: 44,
          width: "100%",
          maxWidth: 280,
          borderRadius: 22,
          fontSize: 13,
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Trang chủ
      </a>

      <p className="text-[12px] text-[var(--color-text-secondary)]" aria-live="polite">
        Tự động chuyển sang Vé của tôi sau {countdown}s
      </p>
    </div>
  );

  const content = finished ? (
    // Sóng đã chạy xong: gỡ canvas để không còn ảnh cũ chồng lên chữ của màn hình kết quả.
    <div className="block w-full bg-[var(--color-bg-primary)]">{successView}</div>
  ) : (
    <DistortionWave
      ref={waveRef}
      revealed={revealed}
      type="vertical"
      palette="colorful"
      // Chỉ vẽ màu, không chụp ảnh hai lớp view: tránh ảnh cũ chồng lên chữ
      capture={false}
      className="block w-full bg-[var(--color-bg-primary)]"
      revealedContent={successView}
      onFinish={(isRevealed) => {
        if (!isRevealed) return;
        finishWave();
      }}
    >
      {payView}
    </DistortionWave>
  );

  if (inline) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-primary)]">
        {content}
      </div>
    );
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
      {content}
    </dialog>,
    document.body,
  );
}
