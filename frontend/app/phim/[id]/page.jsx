"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/common/Badge';
import SeatPicker from '@/components/booking/SeatPicker';
import TrailerModal from '@/components/movie/TrailerModal';
import MovieDetailSkeleton from '@/components/movie/MovieDetailSkeleton';
import { IconArrowLeft, IconClock, IconCalendar, IconPlay } from '@/components/common/Icons';
import { fetchMovieById, fetchShowtimesByMovie, fetchSeatsByRoom } from '@/services/movieApi';
import {
  AGE_LABEL,
  STATUS_LABEL,
  SEAT_TYPE_SURCHARGE,
  SEAT_TYPE_LABEL,
  formatCurrency,
  formatDuration,
  groupByDate,
  groupByCinema,
  groupSeatsByRow,
} from '@/utils/movieHelpers';

// Keyframes cho các hiệu ứng chuyển đổi của trang
const PAGE_ANIMATIONS = `
@keyframes mv-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes mv-section-in {
  from { opacity: 0; transform: translateY(20px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes mv-slide-in {
  from { opacity: 0; transform: translateX(14px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes mv-pop {
  0% { transform: scale(0.94); }
  55% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
.mv-fade-up { animation: mv-fade-up 380ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.mv-section-in { animation: mv-section-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.mv-slide-in { animation: mv-slide-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.mv-pop { animation: mv-pop 320ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@media (prefers-reduced-motion: reduce) {
  .mv-fade-up, .mv-section-in, .mv-slide-in, .mv-pop { animation: none !important; }
}
`;

// Số tiền chạy mượt từ giá trị cũ sang giá trị mới
function useAnimatedNumber(target, duration = 450) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (target - from) * eased);
      fromRef.current = value;
      setDisplay(value);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Thanh trượt của bộ chọn ngày
  const dateGridRef = useRef(null);
  const dateBtnRefs = useRef({});
  const [dateIndicator, setDateIndicator] = useState(null);
  const [dateIndicatorReady, setDateIndicatorReady] = useState(false);

  // Cuộn mượt tới phần chọn ghế
  const seatSectionRef = useRef(null);
  const seatSectionWasOpen = useRef(false);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    Promise.all([fetchMovieById(id), fetchShowtimesByMovie(id)])
      .then(([movieData, showtimeData]) => {
        if (!active) return;
        setMovie(movieData);
        setShowtimes(showtimeData);
        const dates = groupByDate(showtimeData);
        setSelectedDate(dates[0]?.[0] ?? null);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [id]);

  const selectedShowtime = useMemo(
    () => showtimes.find((s) => (s.showtimeId ?? s.id) === selectedShowtimeId),
    [showtimes, selectedShowtimeId]
  );

  useEffect(() => {
    if (!selectedShowtime?.roomId) {
      setSeats([]);
      setSelectedSeats([]);
      return;
    }

    let active = true;
    setLoadingSeats(true);
    setSelectedSeats([]);
    fetchSeatsByRoom(selectedShowtime.roomId)
      .then((data) => {
        if (!active) return;
        if (!data || data.length === 0) {
          const mockSeats = [];
          const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
          rows.forEach((r, rowIndex) => {
            for (let i = 1; i <= 10; i++) {
              let type = 'NORMAL';
              if (rowIndex >= 2 && rowIndex <= 4) {
                type = 'VIP';
              } else if (rowIndex === 6 && (i === 1 || i === 2)) {
                type = 'ACCESSIBLE';
              } else if (rowIndex === 7) {
                type = 'SWEETBOX';
              }
              mockSeats.push({
                id: `${r}-${i}`,
                row: r,
                number: i,
                type,
                isSold: (rowIndex === 3 && i === 2) || (rowIndex === 4 && i === 3),
              });
            }
          });
          setSeats(mockSeats);
        } else {
          setSeats(data);
        }
        setLoadingSeats(false);
      })
      .catch(() => {
        if (!active) return;
        setSeats([]);
        setLoadingSeats(false);
      });

    return () => {
      active = false;
    };
  }, [selectedShowtime?.roomId]);

  const showtimesByDate = useMemo(() => groupByDate(showtimes), [showtimes]);
  const dateOptions = showtimesByDate.map(([date]) => date);
  const showtimesForSelectedDate = showtimesByDate.find(([date]) => date === selectedDate)?.[1] ?? [];
  const showtimesByCinema = useMemo(() => groupByCinema(showtimesForSelectedDate), [showtimesForSelectedDate]);
  const seatsByRow = useMemo(() => groupSeatsByRow(seats), [seats]);

  const basePrice = Number(selectedShowtime?.basePrice ?? 120000);

  const grandTotal = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => {
      const surcharge = SEAT_TYPE_SURCHARGE[seat.type] ?? 0;
      return sum + basePrice + surcharge;
    }, 0);
  }, [selectedSeats, basePrice]);

  const animatedTotal = useAnimatedNumber(grandTotal);

  // Đo vị trí nút ngày đang chọn để thanh trượt di chuyển tới đó
  useLayoutEffect(() => {
    const grid = dateGridRef.current;
    const button = dateBtnRefs.current[selectedDate];
    if (!grid || !button) {
      setDateIndicator(null);
      return;
    }

    const update = () =>
      setDateIndicator({
        left: button.offsetLeft,
        top: button.offsetTop,
        width: button.offsetWidth,
        height: button.offsetHeight,
      });

    update();
    const observer = new ResizeObserver(update);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [selectedDate, dateOptions.length, status]);

  // Lần đo đầu tiên đặt thẳng vào vị trí, từ lần sau mới có hiệu ứng trượt
  useEffect(() => {
    if (dateIndicator && !dateIndicatorReady) {
      const raf = requestAnimationFrame(() => setDateIndicatorReady(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [dateIndicator, dateIndicatorReady]);

  // Cuộn xuống phần chọn ghế khi vừa chọn suất chiếu đầu tiên
  useEffect(() => {
    const open = Boolean(selectedShowtimeId);
    if (open && !seatSectionWasOpen.current) {
      const raf = requestAnimationFrame(() => {
        seatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      seatSectionWasOpen.current = open;
      return () => cancelAnimationFrame(raf);
    }
    seatSectionWasOpen.current = open;
  }, [selectedShowtimeId]);

  const toggleSeatSelection = (seat) => {
    if (seat.isSold) return;
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        <Header />
        <MovieDetailSkeleton />
        <Footer />
      </div>
    );
  }

  if (status === 'error' || !movie) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        <Header />
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="text-[16px] text-[var(--color-text-primary)]">Không tải được thông tin phim.</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] px-6 py-3 text-[14px] font-medium text-[var(--color-brand-on-primary)]"
          >
            Quay lại
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const genres = movie.genres ?? [];
  const selectedSeatLabels = selectedSeats.map((s) => `${s.row}${String(s.number).padStart(2, '0')}`);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <style>{PAGE_ANIMATIONS}</style>
      <Header />

      <div className="mx-auto max-w-6xl px-5 pt-6 md:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-all duration-200 hover:-translate-x-0.5 hover:text-[var(--color-text-primary)]"
        >
          <IconArrowLeft /> Quay lại
        </button>
      </div>

      <div className="relative mt-4 h-[180px] w-full overflow-hidden md:h-[240px]">
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-40 blur-[4px]"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 10%, var(--color-bg-primary) 100%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-5 pb-20 md:-mt-24 md:px-8">
        <div className="mv-fade-up flex flex-col gap-6 md:flex-row md:gap-8">
          <div className="aspect-[3/4] w-[150px] shrink-0 overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-high)] md:w-[200px]">
            {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />}
          </div>

          <div className="flex-1 pt-1 md:pt-4">
            {movie.status && <Badge tone="brand">{STATUS_LABEL[movie.status] ?? movie.status}</Badge>}

            <h1 className="mt-2 text-[26px] font-bold leading-[1.2] text-[var(--color-text-primary)] md:text-[32px]">
              {movie.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[var(--color-text-secondary)]">
              {movie.durationMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <IconClock /> {formatDuration(movie.durationMinutes)}
                </span>
              )}
              {movie.releaseDate && (
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar /> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                </span>
              )}
              {movie.ageRestriction && <Badge>{AGE_LABEL[movie.ageRestriction] ?? movie.ageRestriction}</Badge>}
            </div>

            {genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {genres.map((g, index) => (
                  <Badge key={`${g}-${index}`}>{g}</Badge>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-col gap-1 text-[13px] text-[var(--color-text-secondary)]">
              {movie.director && (
                <p>
                  <strong className="font-semibold text-[var(--color-text-primary)]">Đạo diễn: </strong>
                  {movie.director}
                </p>
              )}
              {movie.actors && (
                <p>
                  <strong className="font-semibold text-[var(--color-text-primary)]">Diễn viên: </strong>
                  {movie.actors}
                </p>
              )}
            </div>

            {movie.description && (
              <p className="mt-3 max-w-[65ch] text-[14px] leading-[1.5] text-[var(--color-text-primary)]">
                {movie.description}
              </p>
            )}

            {movie.trailerUrl && (
              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border-opaque-separator)] px-4 py-2 text-[13px] font-medium text-[var(--color-text-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] active:scale-95"
              >
                <IconPlay /> Xem trailer
              </button>
            )}
          </div>
        </div>

        {/* Khối chọn lịch chiếu */}
        <section className="mt-10 md:mt-12">
          <h2 className="text-[20px] font-semibold text-[var(--color-text-primary)]">Lịch chiếu</h2>

          {dateOptions.length === 0 ? (
            <p className="mt-3 text-[14px] text-[var(--color-text-secondary)]">
              Phim chưa có suất chiếu được mở bán.
            </p>
          ) : (
            <>
              <div
                ref={dateGridRef}
                className="relative mt-4 grid grid-cols-7 gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-fill-secondary)] p-2 lg:grid-cols-[repeat(14,minmax(0,1fr))]"
              >
                {/* Thanh trượt đánh dấu ngày đang chọn */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-0 top-0 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] shadow-[var(--shadow-low)] ${
                    dateIndicatorReady
                      ? 'transition-[transform,width,height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
                      : ''
                  }`}
                  style={{
                    transform: `translate(${dateIndicator?.left ?? 0}px, ${dateIndicator?.top ?? 0}px)`,
                    width: dateIndicator?.width ?? 0,
                    height: dateIndicator?.height ?? 0,
                    opacity: dateIndicator ? 1 : 0,
                  }}
                />

                {dateOptions.map((date) => {
                  const active = date === selectedDate;
                  const d = new Date(date);
                  return (
                    <button
                      key={date}
                      ref={(el) => {
                        dateBtnRefs.current[date] = el;
                      }}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedShowtimeId(null);
                      }}
                      className={`relative z-10 flex min-h-[46px] flex-col items-center justify-center rounded-[var(--radius-sm)] px-1 py-1.5 text-center transition-[color,background-color,transform] duration-200 active:scale-95 ${
                        active
                          ? 'text-[var(--color-brand-on-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <span className="text-[11px] font-medium leading-none opacity-85">
                        {d.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </span>
                      <span className="mt-1 text-[12px] font-bold leading-none">
                        {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* key theo ngày để danh sách rạp chạy lại hiệu ứng mỗi khi đổi ngày */}
              <div key={selectedDate} className="mt-5 flex flex-col gap-4">
                {showtimesByCinema.map((cinema, cinemaIndex) => (
                  <div
                    key={cinema.name}
                    className="mv-fade-up rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] p-5 shadow-[var(--shadow-low)]"
                    style={{ animationDelay: `${cinemaIndex * 70}ms` }}
                  >
                    <div className="flex flex-col gap-0.5 border-b border-[var(--color-border-separator)] pb-3">
                      <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                        {cinema.name}
                      </h3>
                      {cinema.address && (
                        <p className="text-[12px] text-[var(--color-text-secondary)]">{cinema.address}</p>
                      )}
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-2.5">
                      {cinema.items.map((s) => {
                        const sid = s.showtimeId ?? s.id;
                        const active = sid === selectedShowtimeId;
                        return (
                          <button
                            key={sid}
                            type="button"
                            onClick={() => setSelectedShowtimeId(sid)}
                            className={`flex min-h-[42px] items-center gap-1.5 rounded-[var(--radius-sm)] border px-4 text-[13px] font-semibold transition-all duration-200 ease-out active:scale-95 ${
                              active
                                ? 'mv-pop border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]'
                                : 'border-[var(--color-border-separator)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] hover:-translate-y-0.5 hover:border-[var(--color-border-opaque-separator)] hover:bg-[var(--color-bg-secondary)]'
                            }`}
                          >
                            <span>
                              {new Date(s.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {s.roomType && (
                              <span className={`text-[11px] font-normal transition-opacity duration-200 ${active ? 'opacity-90' : 'text-[var(--color-text-secondary)]'}`}>
                                ({s.roomType})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Khối sơ đồ ghế & Vé */}
        {selectedShowtimeId && (
          <section ref={seatSectionRef} className="mv-section-in mt-12 scroll-mt-24">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-system-success)]/15 px-3.5 py-1.5 text-[12px] font-semibold text-[var(--color-system-success)]">
                <span>1 Suất chiếu</span>
              </div>
              <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]">
                <span>2 Chọn ghế</span>
              </div>
              <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-fill-secondary)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--color-text-tertiary)]">
                <span>3 Xác nhận</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-[26px] font-bold text-[var(--color-text-primary)]">Chọn ghế</h2>
              <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">
                Chọn chỗ ngồi của bạn. Tổng tiền được cập nhật ngay khi chọn ghế.
              </p>
            </div>

            {/* key theo suất chiếu để thông tin đổi suất có hiệu ứng hiện lại */}
            <div
              key={selectedShowtimeId}
              className="mv-fade-up mt-5 flex flex-col justify-between gap-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] p-5 border border-[var(--color-border-separator)] md:flex-row md:items-center"
            >
              <div>
                <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">{movie.title}</h3>
                <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
                  {selectedShowtime?.cinemaName || 'Seenema Cinema'}
                </p>
              </div>
              <div className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                {selectedDate &&
                  new Date(selectedDate).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}{' '}
                ·{' '}
                {selectedShowtime?.startTime
                  ? new Date(selectedShowtime.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}{' '}
                · Phòng {selectedShowtime?.roomName || '01'} · {selectedShowtime?.roomType || '2D'}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex-1 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-separator)] p-6 shadow-[var(--shadow-low)] md:p-8">
                <SeatPicker
                  loadingSeats={loadingSeats}
                  seatsByRow={seatsByRow}
                  selectedSeats={selectedSeats}
                  onToggleSeat={toggleSeatSelection}
                />
              </div>

              {/* Sidebar Tóm tắt vé */}
              <div className="w-full shrink-0 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-separator)] p-6 shadow-[var(--shadow-low)] lg:w-[340px]">
                <h3 className="text-[18px] font-bold text-[var(--color-text-primary)]">Vé của bạn</h3>

                <div className="mt-4 border-t border-[var(--color-border-separator)] pt-4">
                  <h4 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{movie.title}</h4>
                  <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                    {selectedShowtime?.cinemaName || 'Seenema Cinema'}
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
                    {selectedDate && new Date(selectedDate).toLocaleDateString('vi-VN')} ·{' '}
                    {selectedShowtime?.startTime
                      ? new Date(selectedShowtime.startTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}{' '}
                    · Phòng {selectedShowtime?.roomName || '01'}
                  </p>
                </div>

                <div className="mt-4 border-t border-[var(--color-border-separator)] pt-4">
                  <p className="text-[12px] text-[var(--color-text-secondary)]">Ghế đã chọn</p>
                  <p
                    key={selectedSeatLabels.join('|')}
                    className="mv-fade-up mt-1 text-[15px] font-bold text-[var(--color-brand-primary)]"
                  >
                    {selectedSeats.length > 0 ? selectedSeatLabels.join(' · ') : 'Chưa chọn ghế'}
                  </p>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border-separator)] pt-4 text-[13px]">
                    {selectedSeats.map((seat) => {
                      const surcharge = SEAT_TYPE_SURCHARGE[seat.type] ?? 0;
                      const seatPrice = basePrice + surcharge;
                      return (
                        <div
                          key={seat.id}
                          className="mv-slide-in flex justify-between text-[var(--color-text-secondary)]"
                        >
                          <span>
                            Ghế {seat.row}{String(seat.number).padStart(2, '0')}{' '}
                            <span className="text-[11px] opacity-80">({SEAT_TYPE_LABEL[seat.type] || 'Thường'})</span>
                          </span>
                          <span className="font-semibold text-[var(--color-text-primary)]">
                            {formatCurrency(seatPrice)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-5 border-t border-[var(--color-border-separator)] pt-4">
                  <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Tổng cộng</span>
                  <div className="mt-1 text-[26px] font-bold tabular-nums text-[var(--color-brand-primary)]">
                    {formatCurrency(animatedTotal)}
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
                    Giá vé được hiển thị minh bạch trước khi xác nhận.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={selectedSeats.length === 0}
                  onClick={() => {
                    // Chuyển sang trang thanh toán (chưa làm).
                    // Dữ liệu ghế và tổng tiền sẽ được lưu vào sessionStorage hoặc context khi làm bước này.
                    router.push(`/dat-ve/${selectedShowtimeId}`);
                  }}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-primary)] py-3.5 text-[14px] font-semibold text-[var(--color-brand-on-primary)] transition-all duration-300 hover:bg-[var(--color-brand-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>Tiếp tục</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>

                <p className="mt-3 text-center text-[12px] text-[var(--color-text-tertiary)]">
                  Bạn có thể quay lại để đổi ghế trước khi thanh toán.
                </p>

                <div className="mt-6 border-t border-[var(--color-border-separator)] pt-4 text-center text-[12px] text-[var(--color-text-tertiary)]">
                  Cần hỗ trợ? Liên hệ chăm sóc khách hàng.
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        title={movie.title}
      />

      <Footer />
    </div>
  );
}