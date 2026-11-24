"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ShowMoreButton from '@/components/common/ShowMoreButton';
import PaymentQrModal from '@/components/booking/PaymentQrModal';
import { usePagedGrid } from '@/utils/usePagedGrid';

const TIME_ZONE = 'Asia/Ho_Chi_Minh';
// Vé xếp một cột: 3 vé đầu, mỗi lần bấm mở thêm 2 vé; mỗi lần chỉ tải 10 vé.
const FIRST_ROWS = 3;
const STEP_ROWS = 2;
const TICKET_PAGE_SIZE = 10;

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function formatVND(value) {
  return currency.format(Number(value) || 0);
}

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

// "mm:ss" cho đồng hồ đếm ngược giữ chỗ
function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Nhãn trạng thái vé: ưu tiên trạng thái thanh toán, sau đó tới trạng thái booking
function statusBadge(ticket, now) {
  if (ticket.paymentStatus === 'SUCCESS' || ticket.status === 'PAID') {
    return { text: 'Đã thanh toán', tone: 'success' };
  }
  if (ticket.status === 'CANCELLED') {
    return { text: 'Đã huỷ', tone: 'muted' };
  }
  if (ticket.status === 'EXPIRED') {
    return { text: 'Đã hết hạn thanh toán', tone: 'error' };
  }
  if (ticket.paymentStatus === 'FAILED') {
    return { text: 'Thanh toán thất bại', tone: 'error' };
  }
  // Vé chờ thanh toán nhưng đã quá hạn giữ chỗ: coi như hết hạn, không phải chờ nữa
  if (ticket.holdUntil && new Date(ticket.holdUntil).getTime() <= now) {
    return { text: 'Đã hết hạn thanh toán', tone: 'error' };
  }
  return { text: 'Chờ thanh toán', tone: 'warning' };
}

const TONE_CLASS = {
  success: 'bg-[var(--color-brand-primary-container)] text-[var(--color-brand-primary)]',
  warning: 'bg-[var(--color-fill-tertiary)] text-[var(--color-system-warning)]',
  error: 'bg-[var(--color-system-error)]/10 text-[var(--color-system-error)]',
  muted: 'bg-[var(--color-fill-tertiary)] text-[var(--color-text-secondary)]',
};

// "D9" -> { row: 'D', number: 9 } để PaymentQrModal hiển thị đúng
function toSeatObjects(labels, seatIds) {
  return labels.map((label, index) => {
    const match = /^([A-Za-z]+)\s*(\d+)$/.exec(label.trim());

    return {
      id: seatIds[index] ?? `${label}-${index}`,
      row: match ? match[1] : label,
      number: match ? Number(match[2]) : 0,
    };
  });
}

export default function MyTicketsPage() {
  // Thanh toán lại vé còn hiệu lực
  const [payingTicket, setPayingTicket] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  // Đồng hồ chung để hạn giữ chỗ trên thẻ vé và trong modal luôn khớp nhau
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mỗi lần chỉ tải một trang vé; "Xem thêm" tự gọi trang kế tiếp khi cần.
  const fetchTickets = useCallback(async (page, size) => {
    const res = await fetch(`/api/bookings?page=${page}&size=${size}`, { cache: 'no-store' });

    if (res.status === 401) {
      const unauth = new Error('Vui lòng đăng nhập để xem vé.');
      unauth.code = 'unauth';
      throw unauth;
    }

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(body?.message || 'Không tải được danh sách vé.');
    }

    // Server cũ trả mảng: gói lại thành một trang.
    const payload = Array.isArray(body)
      ? { content: body, page: 0, size, totalElements: body.length, totalPages: 1 }
      : body;

    const currentPage = Number(payload?.page ?? page);
    const totalPages = Number(payload?.totalPages ?? 1);

    return {
      items: payload?.content ?? [],
      page: currentPage,
      total: Number(payload?.totalElements ?? 0),
      totalPages,
      hasMore: currentPage + 1 < totalPages,
    };
  }, []);

  const grid = usePagedGrid({
    fetchPage: fetchTickets,
    pageSize: TICKET_PAGE_SIZE,
    initialRows: FIRST_ROWS,
    stepRows: STEP_ROWS,
  });

  const tickets = grid.items;
  const { reload: reloadTickets } = grid;

  // status: 'loading' | 'ready' | 'unauth' | 'error'
  const status = grid.error
    ? grid.error.code === 'unauth'
      ? 'unauth'
      : 'error'
    : grid.loading && tickets.length === 0
      ? 'loading'
      : 'ready';
  const error = grid.error && grid.error.code !== 'unauth' ? grid.error.message : '';

  // Vé còn thanh toán được: chưa trả tiền, chưa huỷ, còn trong hạn giữ chỗ và
  // suất chiếu chưa bắt đầu. Hạn này KHÔNG được gia hạn khi quay lại sau.
  function canPay(ticket, now) {
    if (ticket.status !== 'PENDING') return false;
    if (ticket.paymentStatus === 'SUCCESS') return false;
    if (!ticket.startTime) return true;
    return new Date(ticket.startTime).getTime() > now;
  }

  function holdRemainingMs(ticket, now) {
    if (!ticket.holdUntil) return null;
    return new Date(ticket.holdUntil).getTime() - now;
  }

  async function createPayment(ticket) {
    setPaymentLoading(true);
    setPaymentError('');

    try {
      const res = await fetch('/api/payments/vnpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: ticket.bookingId }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.message || 'Không thể tạo giao dịch thanh toán.');
      }

      setPayment({ payUrl: body.payUrl });
    } catch (err) {
      setPaymentError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  }

  function handlePay(ticket) {
    setPayingTicket(ticket);
    setPayment(null);
    setPaymentError('');
    setPaymentOpen(true);
    createPayment(ticket);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />

      <main className="animate-fade-in mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Vé của tôi</h1>

          <Link
            href="/cai-dat"
            className="text-xs font-semibold text-[var(--color-brand-primary)] hover:underline"
          >
            ← Cài đặt
          </Link>
        </div>

        {status === 'loading' && (
          <div aria-hidden="true" className="mt-8 space-y-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-5"
              >
                <div className="h-28 w-20 shrink-0 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-fill-tertiary)]" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 animate-pulse rounded-full bg-[var(--color-fill-tertiary)]" />
                  <div className="h-3 w-64 animate-pulse rounded-full bg-[var(--color-fill-tertiary)]" />
                  <div className="h-3 w-40 animate-pulse rounded-full bg-[var(--color-fill-tertiary)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'unauth' && (
          <div className="animate-fade-in mt-8 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-8 text-center shadow-[var(--shadow-low)]">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Đăng nhập để xem vé của bạn.
            </p>
            <Link
              href="/dang-nhap"
              className="mt-4 inline-flex h-10 items-center rounded-full bg-[var(--color-brand-fill)] px-6 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-fill-hover)] active:scale-95"
            >
              Đăng nhập
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in mt-8 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-8 text-center shadow-[var(--shadow-low)]">
            <p className="text-sm text-[var(--color-system-error)]">{error}</p>
          </div>
        )}

        {status === 'ready' && tickets.length === 0 && (
          <div className="animate-fade-in mt-8 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-10 text-center shadow-[var(--shadow-low)]">
            <p className="text-sm font-medium">Bạn chưa có vé nào.</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Chọn phim và suất chiếu để đặt vé đầu tiên.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-10 items-center rounded-full bg-[var(--color-brand-fill)] px-6 text-xs font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-fill-hover)] active:scale-95"
            >
              Xem phim đang chiếu
            </Link>
          </div>
        )}

        {status === 'ready' && tickets.length > 0 && (
          <>
          <ul ref={grid.gridRef} id="danh-sach-ve" className="mt-8 scroll-mt-24 space-y-4">
            {tickets.slice(0, grid.visibleCount).map((ticket, index) => {
              const badge = statusBadge(ticket, now);
              const remaining = holdRemainingMs(ticket, now);

              return (
                <li
                  key={ticket.bookingId}
                  className="ticket-item"
                  style={{ '--i': index }}
                >
                  <div className="ticket-card overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] shadow-[var(--shadow-low)]">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row">
                    {ticket.posterUrl ? (
                      // Ảnh poster lấy từ TMDB, dùng thẻ img để không cần cấu hình next/image
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ticket.posterUrl}
                        alt={ticket.movieTitle ? `Poster ${ticket.movieTitle}` : 'Poster phim'}
                        className="h-32 w-24 shrink-0 rounded-[var(--radius-sm)] object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-fill-tertiary)] text-[11px] text-[var(--color-text-tertiary)]">
                        Không có ảnh
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="text-lg font-semibold tracking-tight text-pretty">
                          {ticket.movieTitle ?? `Suất chiếu #${ticket.showtimeId}`}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONE_CLASS[badge.tone]}`}
                        >
                          {badge.text}
                        </span>
                      </div>

                      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
                        <div className="flex gap-1.5">
                          <dt className="shrink-0 text-[var(--color-text-secondary)]">Suất chiếu:</dt>
                          <dd className="font-medium whitespace-nowrap">{formatDateTime(ticket.startTime)}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="shrink-0 text-[var(--color-text-secondary)]">Rạp:</dt>
                          <dd className="font-medium text-pretty">
                            {ticket.cinemaName && (
                              // Dấu · dính vào rạp để dòng sau không bắt đầu bằng "·"
                              <span>{`${ticket.cinemaName}\u00A0·\u00A0`}</span>
                            )}
                            {/* Tên phòng không tách rời số phòng, tránh chữ "4" rơi xuống dòng riêng */}
                            {ticket.roomName && (
                              <span className="whitespace-nowrap">{ticket.roomName}</span>
                            )}
                            {!ticket.cinemaName && !ticket.roomName && '—'}
                          </dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="shrink-0 text-[var(--color-text-secondary)]">Ghế:</dt>
                          <dd className="font-medium">
                            {ticket.seats.length > 0 ? ticket.seats.join(', ') : '—'}
                          </dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="shrink-0 text-[var(--color-text-secondary)]">Mã vé:</dt>
                          <dd className="font-medium">#{ticket.bookingId}</dd>
                        </div>
                      </dl>
                    </div>
                    </div>

                    {/* Đường kẻ và hàng giá nằm ngoài khối flex để chạy hết bề ngang thẻ */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-separator)] px-5 py-3">
                        {ticket.createdAt ? (
                          <p className="text-[12px] text-[var(--color-text-tertiary)]">
                            Đặt lúc {formatDateTime(ticket.createdAt)}
                          </p>
                        ) : (
                          <span />
                        )}

                        <div className="flex flex-wrap items-center justify-end gap-3">
                          {canPay(ticket, now) && remaining !== null && remaining <= 0 && (
                            <p className="max-w-[16rem] text-right text-[11px] text-[var(--color-system-error)]">
                              Đã hết thời gian giữ chỗ — vui lòng đặt lại vé.
                            </p>
                          )}

                          {canPay(ticket, now) && remaining !== null && remaining > 0 && (
                            <p className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                              Còn {formatCountdown(remaining)} để thanh toán
                            </p>
                          )}

                          <p className="text-lg font-semibold text-[var(--color-brand-primary)]">
                            {formatVND(ticket.amount)}
                          </p>

                          {canPay(ticket, now) &&
                            (remaining === null || remaining > 0) && (
                            <button
                              type="button"
                              onClick={() => handlePay(ticket)}
                              className="ticket-pay-button h-9 rounded-full bg-[var(--color-brand-fill)] px-4 text-xs font-semibold text-[var(--color-brand-on-primary)] hover:bg-[var(--color-brand-fill-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
                            >
                              Thanh toán ngay
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                </li>
              );
            })}
          </ul>
          {grid.canShowMore && (
            <ShowMoreButton onClick={grid.showMore} />
          )}
          </>
        )}
      </main>

      <PaymentQrModal
        open={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          reloadTickets();
        }}
        bookingId={payingTicket?.bookingId}
        showtime={
          payingTicket
            ? {
                movieTitle: payingTicket.movieTitle,
                startTime: payingTicket.startTime,
                room: payingTicket.roomName,
                cinemaName: payingTicket.cinemaName,
              }
            : undefined
        }
        cinema={payingTicket?.cinemaName}
        seats={
          payingTicket
            ? toSeatObjects(payingTicket.seats ?? [], payingTicket.seatIds ?? [])
            : []
        }
        total={payingTicket?.amount ?? 0}
        holdUntil={payingTicket?.holdUntil ?? null}
        payment={payment}        loading={paymentLoading}
        error={paymentError}
        onCreateQr={() => payingTicket && createPayment(payingTicket)}
      />

      <Footer />
    </div>
  );
}
