"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SeatPicker, { SEAT_ANIMATIONS } from './SeatPicker';
import { getCachedSeats, getSessionId, invalidateSeats, loadSeats } from '@/services/seatApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';
const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const STEP_OUT_MS = 170;

// Giá trị rạp mà Hero Section gửi khi người dùng không chọn rạp cụ thể
const ALL_CINEMAS = 'Tất cả rạp';

// Các bước hiển thị trên thanh tiến trình. Bước 5 (Xác nhận) sẽ nối với phần thanh toán sau.
const STEP_LABELS = ['Thành phố', 'Rạp chiếu', 'Suất chiếu', 'Chọn ghế', 'Xác nhận'];

// Hệ số giá theo loại ghế, tạm thời dùng ở frontend.
// Khi backend trả sẵn seat.price cho từng ghế thì giá trị đó được ưu tiên và bảng này không còn dùng.
const SEAT_PRICE_MULTIPLIER = { VIP: 1.25, DOUBLE: 2, SWEETBOX: 2, COUPLE: 2 };

// Hiệu ứng chuyển bước và đổi chiều cao khung. Các hiệu ứng pop, fade lấy từ SEAT_ANIMATIONS của SeatPicker.
const FLOW_STYLES = `
@keyframes sf-in-right { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
@keyframes sf-in-left  { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }
@keyframes sf-out-left  { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-16px); } }
@keyframes sf-out-right { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(16px); } }
.sf-in-right  { animation: sf-in-right 420ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.sf-in-left   { animation: sf-in-left 420ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.sf-out-left  { animation: sf-out-left ${STEP_OUT_MS}ms ease-in both; }
.sf-out-right { animation: sf-out-right ${STEP_OUT_MS}ms ease-in both; }
.sf-body { transition: height 420ms cubic-bezier(0.22, 1, 0.36, 1); }
@media (prefers-reduced-motion: reduce) {
  .sf-in-right, .sf-in-left, .sf-out-left, .sf-out-right { animation: none !important; }
  .sf-body { transition: none !important; }
}
`;

const EMPTY_LIST = { status: 'idle', items: [] };

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TIME_ZONE,
  });
}

function formatLongDate(iso) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TIME_ZONE,
  });
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Khóa ngày dạng YYYY-MM-DD của một suất chiếu, tính theo múi giờ rạp để khớp với giờ hiển thị
function dateKeyOf(iso) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIME_ZONE,
  }).formatToParts(new Date(iso));
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

// Khóa ngày của máy người dùng, dùng để biết hôm nay là ngày nào
function localDateKey(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Bỏ dấu tiếng Việt để gõ "bo gia" vẫn tìm ra "Bố Già"
function foldText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

// Mọi từ trong ô tìm đều phải xuất hiện trong chuỗi, không cần đúng thứ tự
function matchesText(text, query) {
  const tokens = foldText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = foldText(text);
  return tokens.every((t) => haystack.includes(t));
}

function formatVND(amount) {
  return `${Number(amount || 0).toLocaleString('vi-VN')}đ`;
}

function seatName(seat) {
  return `${seat.row}${String(seat.number).padStart(2, '0')}`;
}

function getSeatPrice(seat, showtime) {
  if (typeof seat.price === 'number') return seat.price;
  const base = Number(showtime?.basePrice ?? 0);
  return Math.round(base * (SEAT_PRICE_MULTIPLIER[seat.type] ?? 1));
}

// Tổng tiền: số chạy dần từ giá trị cũ lên giá trị mới và phóng nhẹ cùng đường cong với sp-pop của SeatPicker.
// Cập nhật thẳng vào DOM bằng requestAnimationFrame nên không kéo cả modal và sơ đồ ghế render lại mỗi khung hình.
function AnimatedPrice({ value, className = '' }) {
  const ref = useRef(null);
  const shownRef = useRef(value);
  // Nội dung ban đầu cố định, React không đụng lại text node nên không bị nháy giá trị cuối trước khi chạy
  const initialText = useRef(formatVND(value)).current;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = shownRef.current;
    if (prefersReducedMotion() || from === value) {
      shownRef.current = value;
      el.textContent = formatVND(value);
      return;
    }

    el.animate?.(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: 0.45 }, { transform: 'scale(1)' }],
      { duration: 320, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
    );

    const duration = 420;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (value - from) * eased);
      shownRef.current = next;
      el.textContent = formatVND(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span ref={ref} className={`inline-block origin-left tabular-nums will-change-transform ${className}`}>
      {initialText}
    </span>
  );
}

function groupByMovie(showtimes) {
  const map = new Map();
  for (const s of showtimes) {
    if (!map.has(s.movieTitle)) map.set(s.movieTitle, []);
    map.get(s.movieTitle).push(s);
  }
  return Array.from(map.entries()).map(([title, items]) => [
    title,
    [...items].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
  ]);
}

// Backend đã sắp xếp theo hàng rồi số ghế, nên chỉ cần gom nhóm theo hàng
function groupSeatsByRow(seats) {
  const map = new Map();
  for (const seat of seats) {
    if (!map.has(seat.row)) map.set(seat.row, []);
    map.get(seat.row).push(seat);
  }
  return Array.from(map.entries());
}

function sameIds(a, b) {
  return a.length === b.length && a.every((s, i) => s.id === b[i].id);
}

// Gọi API giữ / trả ghế. Ném lỗi kèm thông báo từ backend nếu thất bại.
async function seatAction(action, showtimeId, body) {
  const res = await fetch(`${API_BASE_URL}/${action}?showtimeId=${showtimeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || 'Không thể cập nhật ghế, vui lòng thử lại.');
  }
  return data;
}

// GET một danh sách từ backend, bỏ qua các tham số rỗng. Luôn trả về mảng.
async function fetchList(path, params, signal) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const res = await fetch(`${API_BASE_URL}/${path}?${query}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Backend có thể trả chuỗi hoặc object, chuẩn hóa về một dạng duy nhất
function toCity(item) {
  const name = typeof item === 'string' ? item : item?.name ?? item?.city ?? item?.cityName ?? '';
  return { name: String(name).trim() };
}

function toCinema(item) {
  if (typeof item === 'string') return { name: item.trim(), address: '' };
  return {
    name: String(item?.name ?? item?.cinemaName ?? '').trim(),
    address: String(item?.address ?? '').trim(),
  };
}

function uniqueByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.name || seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

// Cache thành phố theo tên phim, sống suốt phiên trang. Chỉ lưu kết quả thành công.
const citiesCache = new Map();

// Gọi khi người dùng đưa chuột vào nút đặt vé, để khi bấm thì danh sách thành phố đã sẵn
export function prefetchCities(movieTitle) {
  if (!movieTitle || citiesCache.has(movieTitle)) return;
  fetchList('getCities', { movieTitle })
    .then((list) => citiesCache.set(movieTitle, uniqueByName(list.map(toCity))))
    .catch(() => {});
}

/**
 * filters: { movieTitle, city?, cinema? } | null
 *   - Chỉ có movieTitle (FeaturedSection, MovieCard, trang chi tiết phim): luồng bắt đầu từ bước chọn thành phố.
 *   - Có thêm city (Hero Section): bỏ qua bước thành phố, bắt đầu từ bước chọn rạp.
 *   - Có thêm cả cinema (Hero Section đã chọn rạp): bỏ qua cả bước rạp, bắt đầu từ bước chọn suất chiếu.
 *     cinema = 'Tất cả rạp' nghĩa là xem suất chiếu của mọi rạp trong thành phố.
 *   Các bước đã bỏ qua vẫn hiện trên thanh tiến trình và bấm vào được để quay lại đổi.
 * searchId: tăng dần mỗi lần bấm Đặt vé / Tìm để bấm lại cùng bộ lọc vẫn mở lại bảng và tải lại dữ liệu
 * onSearchSettled: gọi khi dữ liệu của bước đầu tiên đã tải xong (thành công hay lỗi) để nút bên ngoài hết trạng thái chờ
 * onContinue: gọi khi bấm Tiếp tục, nhận { showtime, seats, total, holdUntil, city, cinema }. Phần thanh toán sẽ nối vào đây sau.
 * variant: 'modal' (mặc định, cửa sổ toàn màn hình) | 'inline' (hiện thẳng trong trang, không có nền mờ và nút đóng).
 * Với 'inline', filters phải được giữ ổn định giữa các lần render (dùng useMemo), nếu không luồng sẽ bị đặt lại liên tục.
 */
export default function BookingFlow({ filters, searchId, onSearchSettled, onContinue, variant = 'modal' }) {
  const inline = variant === 'inline';
  const [open, setOpen] = useState(false);

  // Lựa chọn của người dùng theo từng bước
  const [city, setCity] = useState(null);
  const [cinema, setCinema] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [cinemaQuery, setCinemaQuery] = useState('');

  // Dữ liệu từng bước: { status: 'idle' | 'loading' | 'ready' | 'empty' | 'error', items }
  const [cities, setCities] = useState(EMPTY_LIST);
  const [cinemas, setCinemas] = useState(EMPTY_LIST);
  const [showtimes, setShowtimes] = useState(EMPTY_LIST);
  // Tăng số này để tải lại đúng danh sách bị lỗi khi người dùng bấm Thử lại
  const [reload, setReload] = useState({ cities: 0, cinemas: 0, showtimes: 0 });

  // Ngày đang chọn (YYYY-MM-DD) và thời điểm hiện tại, được cập nhật định kỳ để khóa các suất đã qua giờ
  const [selectedDate, setSelectedDate] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holdUntil, setHoldUntil] = useState(null);
  const [notice, setNotice] = useState(null); // { type: 'error', text }

  // Chuyển bước: 'forward' | 'back' | null (đang đứng yên)
  const [leaving, setLeaving] = useState(null);
  const dirRef = useRef('forward');
  const switchingRef = useRef(false);
  // Chiều cao khung nội dung, đo tự động để khung giãn ra, co lại mượt khi đổi bước
  const [bodyHeight, setBodyHeight] = useState(null);

  const closeButtonRef = useRef(null);
  const headerRef = useRef(null);
  const scrollRef = useRef(null);
  const innerRef = useRef(null);
  const dayStripCleanupRef = useRef(null);
  const panelRef = useRef(null); // khung ngoài, dùng để cuộn trang khi đổi bước ở chế độ nội tuyến
  const firstStepRef = useRef(true);
  // Đã chuyển sang bước thanh toán: giữ nguyên ghế khi component bị gỡ thay vì trả lại
  const handedOffRef = useRef(false);

  const movieQuery = filters?.movieTitle ?? '';

  // Đặt điểm bắt đầu theo filters ngay trong lúc render, không chờ effect. Nếu để effect làm việc này
  // thì ở lần render đầu city vẫn là null và effect tải thành phố sẽ kịp gọi getCities trước khi city được đặt.
  // Có sẵn city thì bỏ qua bước thành phố, có sẵn cả cinema thì bỏ qua luôn bước rạp.
  const [syncedFilters, setSyncedFilters] = useState(null);
  const [syncedSearchId, setSyncedSearchId] = useState(null);
  if (filters && (filters !== syncedFilters || searchId !== syncedSearchId)) {
    setSyncedFilters(filters);
    setSyncedSearchId(searchId);
    const presetCity = filters.city || null;
    setCity(presetCity);
    setCinema(presetCity && filters.cinema ? filters.cinema : null);
  }

  // Thanh chọn ngày: cuộn con lăn chuột thì chuyển thành cuộn ngang, có quán tính nhẹ cho mượt.
  // Dùng ref dạng hàm vì thanh này mount và unmount theo từng bước, và phải gắn sự kiện wheel
  // không thụ động (passive: false) thì mới chặn được cuộn dọc mặc định.
  const dayStripRef = useCallback((node) => {
    if (dayStripCleanupRef.current) {
      dayStripCleanupRef.current();
      dayStripCleanupRef.current = null;
    }
    if (!node) return;

    let target = 0;
    let raf = 0;

    const animate = () => {
      const diff = target - node.scrollLeft;
      if (Math.abs(diff) < 1) {
        node.scrollLeft = target;
        raf = 0;
        return;
      }
      node.scrollLeft += Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.2);
      raf = requestAnimationFrame(animate);
    };

    const onWheel = (event) => {
      if (event.ctrlKey) return; // Ctrl + cuộn là thu phóng, không can thiệp
      // Touchpad vuốt ngang thì trình duyệt đã tự cuộn ngang rồi
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const max = node.scrollWidth - node.clientWidth;
      if (max <= 0) return;

      const delta = event.deltaY * (event.deltaMode === 1 ? 32 : 1);
      const base = raf ? target : node.scrollLeft;
      const next = Math.min(max, Math.max(0, base + delta));
      // Đã tới đầu hoặc cuối thì trả cuộn dọc lại cho khung nội dung
      if (next === base && (base <= 0 || base >= max)) return;

      event.preventDefault();
      if (prefersReducedMotion()) {
        node.scrollLeft = next;
        return;
      }
      target = next;
      if (!raf) raf = requestAnimationFrame(animate);
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    dayStripCleanupRef.current = () => {
      node.removeEventListener('wheel', onWheel);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Số yêu cầu giữ/trả ghế đang chạy, chỉ tải lại sơ đồ khi tất cả đã xong
  const pendingRef = useRef(0);
  // Có yêu cầu giữ/trả ghế bị lỗi: lúc đó mới cần tải lại sơ đồ để đồng bộ với server
  const needsSyncRef = useRef(false);
  // Ghế đang giữ hiện tại, dùng ref để các hàm đóng/đổi suất luôn đọc giá trị mới nhất
  const holdRef = useRef({ showtimeId: null, seatIds: [] });
  // Chỉ áp dụng kết quả của lần tải ghế mới nhất, tránh sơ đồ cũ ghi đè khi người dùng đổi suất nhanh
  const seatsTokenRef = useRef(0);
  // Giữ lại danh sách ghế và giờ giữ ghế cuối cùng để vùng thu gọn vẫn có nội dung trong lúc chạy hiệu ứng
  const lastSeatsRef = useRef([]);
  const lastHoldRef = useRef(null);

  useEffect(() => {
    holdRef.current = {
      showtimeId: selectedShowtime?.id ?? null,
      seatIds: selectedSeats.map((s) => s.id),
    };
  }, [selectedShowtime, selectedSeats]);

  const total = selectedSeats.reduce((sum, s) => sum + getSeatPrice(s, selectedShowtime), 0);

  // Trả ngay các ghế đang giữ (khi đóng bảng, quay lại bước trước, hoặc mở lại)
  const releaseHeldSeats = useCallback(() => {
    const { showtimeId, seatIds } = holdRef.current;
    holdRef.current = { showtimeId: null, seatIds: [] };
    if (showtimeId && seatIds.length > 0) {
      invalidateSeats(showtimeId);
      seatAction('releaseSeats', showtimeId, { sessionId: getSessionId(), seatIds }).catch(() => {});
    }
  }, []);

  // Rời trang (component bị gỡ) thì trả ghế đang giữ, để ghế không bị khóa đến khi hết hạn
  useEffect(
    () => () => {
      if (!handedOffRef.current) releaseHeldSeats();
    },
    [releaseHeldSeats]
  );

  const refreshSeats = useCallback(async (showtimeId, signal) => {
    const token = ++seatsTokenRef.current;
    const list = await loadSeats(showtimeId, signal);
    if (token !== seatsTokenRef.current) return list;
    setSeats(list);
    // Ghế do chính người này giữ (còn hạn) được đánh dấu lại là đang chọn.
    // Nếu không đổi thì giữ nguyên mảng cũ để không render lại và không làm đứt hiệu ứng đang chạy.
    const mine = list.filter((s) => s.heldByMe);
    setSelectedSeats((current) => (sameIds(current, mine) ? current : mine));
    return list;
  }, []);

  // Mỗi lần bấm Đặt vé / Tìm: trả ghế cũ, xóa các lựa chọn phía sau và mở bảng.
  // city và cinema đã được đặt theo filters ở phần đồng bộ trong lúc render phía trên.
  useEffect(() => {
    if (!filters) return;
    releaseHeldSeats();
    lastSeatsRef.current = [];
    lastHoldRef.current = null;
    dirRef.current = 'forward';
    handedOffRef.current = false;

    setOpen(true);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setHoldUntil(null);
    setNotice(null);
    setSelectedDate(null);
    setCinemaQuery('');
    setCinemas(EMPTY_LIST);
    setShowtimes(EMPTY_LIST);
    setNow(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchId]);

  // Bước 1: tải danh sách thành phố khi chưa có thành phố, ưu tiên lấy từ cache
  const needCities = !city;
  useEffect(() => {
    if (!filters || !needCities) return;
    const key = filters.movieTitle;
    const cached = citiesCache.get(key);
    if (cached) {
      setCities({ status: cached.length > 0 ? 'ready' : 'empty', items: cached });
      if (onSearchSettled) onSearchSettled();
      return;
    }

    const controller = new AbortController();
    setCities({ status: 'loading', items: [] });

    fetchList('getCities', { movieTitle: key }, controller.signal)
      .then((list) => {
        const items = uniqueByName(list.map(toCity));
        citiesCache.set(key, items);
        setCities({ status: items.length > 0 ? 'ready' : 'empty', items });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Lỗi khi tải thành phố:', err);
        setCities({ status: 'error', items: [] });
      })
      .finally(() => {
        if (!controller.signal.aborted && onSearchSettled) onSearchSettled();
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchId, needCities, reload.cities]);

  // Bước 2: có thành phố mà chưa có rạp thì tải các rạp ở thành phố đó đang chiếu phim
  const needCinemas = Boolean(city) && !cinema;
  useEffect(() => {
    if (!filters || !needCinemas) return;
    const controller = new AbortController();
    setCinemas({ status: 'loading', items: [] });

    fetchList('getCinemasByCity', { city, movieTitle: movieQuery }, controller.signal)
      .then((list) => {
        const items = uniqueByName(list.map(toCinema));
        setCinemas({ status: items.length > 0 ? 'ready' : 'empty', items });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Lỗi khi tải rạp chiếu:', err);
        setCinemas({ status: 'error', items: [] });
      })
      .finally(() => {
        if (!controller.signal.aborted && onSearchSettled) onSearchSettled();
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchId, city, needCinemas, movieQuery, reload.cinemas]);

  // Bước 3: có thành phố và rạp thì tải suất chiếu của phim.
  // 'Tất cả rạp' nghĩa là không gửi tham số rạp. Ngày được lọc ở frontend để đổi ngày không phải tải lại.
  useEffect(() => {
    if (!filters || !city || !cinema) return;
    const controller = new AbortController();
    setShowtimes({ status: 'loading', items: [] });

    fetchList(
      'searchShowtimes',
      { city, cinema: cinema === ALL_CINEMAS ? '' : cinema, movieTitle: movieQuery },
      controller.signal
    )
      .then((list) => setShowtimes({ status: list.length > 0 ? 'ready' : 'empty', items: list }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Lỗi khi tải suất chiếu:', err);
        setShowtimes({ status: 'error', items: [] });
      })
      .finally(() => {
        if (!controller.signal.aborted && onSearchSettled) onSearchSettled();
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchId, city, cinema, movieQuery, reload.showtimes]);

  // Khi bảng mở: cập nhật giờ hiện tại mỗi 30 giây để suất vừa qua giờ tự bị khóa
  useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [open]);

  // Ở bước chọn ghế: làm mới sơ đồ mỗi 15 giây để thấy ghế người khác vừa đặt.
  // Bỏ qua khi tab đang ẩn hoặc đang có yêu cầu giữ/trả ghế chạy dở.
  useEffect(() => {
    if (!open || !selectedShowtime) return;
    const showtimeId = selectedShowtime.id;
    const id = setInterval(() => {
      if (document.hidden || pendingRef.current > 0) return;
      refreshSeats(showtimeId).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [open, selectedShowtime, refreshSeats]);

  // Tải sơ đồ ghế khi chọn suất chiếu. Dùng dữ liệu vừa prefetch nếu còn mới để mở ghế ngay.
  useEffect(() => {
    if (!selectedShowtime) return;
    const controller = new AbortController();
    const cached = getCachedSeats(selectedShowtime.id);

    if (cached) {
      setSeats(cached);
      const mine = cached.filter((s) => s.heldByMe);
      setSelectedSeats((current) => (sameIds(current, mine) ? current : mine));
      setLoadingSeats(false);
    } else {
      setLoadingSeats(true);
      setSeats([]);
      setSelectedSeats([]);
    }

    refreshSeats(selectedShowtime.id, controller.signal)
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Lỗi khi tải ghế:', err);
        setNotice({ type: 'error', text: 'Không tải được sơ đồ ghế, vui lòng thử lại.' });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSeats(false);
      });

    return () => {
      controller.abort();
      seatsTokenRef.current += 1;
    };
  }, [selectedShowtime, refreshSeats]);

  const step = !city ? 1 : !cinema ? 2 : !selectedShowtime ? 3 : 4;

  // Đổi bước thì cuộn về đầu vùng nội dung.
  // Chế độ nội tuyến: khung không tự cuộn, nên chỉ cuộn trang khi đầu luồng đã trôi lên khỏi màn hình.
  useEffect(() => {
    if (inline) {
      if (firstStepRef.current) {
        firstStepRef.current = false;
        return;
      }
      const panel = panelRef.current;
      if (panel && panel.getBoundingClientRect().top < 0) {
        panel.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step, selectedShowtime, inline]);

  // Đo chiều cao nội dung để khung tự giãn, co lại mượt (không vượt quá 92% chiều cao màn hình)
  const hasFilters = Boolean(filters);
  useEffect(() => {
    if (!hasFilters) return;
    const inner = innerRef.current;
    const header = headerRef.current;
    if (!inner || !header) return;

    const measure = () => {
      // Nội tuyến: khung cao đúng bằng nội dung, trang tự cuộn. Modal: không vượt quá 92% chiều cao màn hình.
      const max = inline ? Infinity : Math.floor(window.innerHeight * 0.92) - header.offsetHeight - 2;
      setBodyHeight(Math.max(0, Math.min(inner.offsetHeight, max)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    observer.observe(header);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [hasFilters, inline]);

  // Khi bảng mở: khóa cuộn nền, Escape để đóng, đưa focus vào nút đóng
  useEffect(() => {
    if (!open || inline) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(event) {
      if (event.key === 'Escape') closeModal();
    }
    document.addEventListener('keydown', onKeyDown);
    const focusId = setTimeout(() => closeButtonRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(focusId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function closeModal() {
    releaseHeldSeats();
    setOpen(false);
  }

  // Chuyển bước có hiệu ứng: nội dung cũ trượt mờ đi, sau đó nội dung mới trượt vào
  function runTransition(direction, action) {
    if (switchingRef.current) return;
    if (prefersReducedMotion()) {
      dirRef.current = direction;
      action();
      return;
    }
    switchingRef.current = true;
    setLeaving(direction);
    setTimeout(() => {
      dirRef.current = direction;
      action();
      setLeaving(null);
      switchingRef.current = false;
    }, STEP_OUT_MS);
  }

  function handleChooseCity(item) {
    runTransition('forward', () => {
      setCinemaQuery('');
      setNotice(null);
      setCity(item.name);
    });
  }

  function handleChooseCinema(item) {
    runTransition('forward', () => {
      setSelectedDate(null);
      setNotice(null);
      setCinema(item.name);
    });
  }

  function handleChooseShowtime(showtime) {
    // Suất đã qua giờ thì không cho chọn (nút cũng đã bị disabled, đây là lớp bảo vệ thứ hai)
    if (new Date(showtime.startTime).getTime() <= Date.now()) return;
    runTransition('forward', () => {
      releaseHeldSeats();
      lastSeatsRef.current = [];
      lastHoldRef.current = null;
      setNotice(null);
      setHoldUntil(null);
      setSelectedShowtime(showtime);
    });
  }

  // Quay lại bước n (1: thành phố, 2: rạp, 3: suất chiếu). Chỉ xóa những lựa chọn nằm sau bước đó.
  function handleBackTo(n) {
    runTransition('back', () => {
      releaseHeldSeats();
      lastSeatsRef.current = [];
      lastHoldRef.current = null;
      setNotice(null);
      setHoldUntil(null);
      setSelectedSeats([]);
      setSelectedShowtime(null);
      if (n <= 2) {
        setCinema(null);
        setSelectedDate(null);
        setShowtimes(EMPTY_LIST);
      }
      if (n <= 1) {
        setCity(null);
        setCinemaQuery('');
        setCinemas(EMPTY_LIST);
      }
    });
  }

  // Bấm vào bước đã qua trên thanh các bước để quay lại
  function handleGoToStep(n) {
    if (n < step) handleBackTo(n);
  }

  function retry(key) {
    setReload((current) => ({ ...current, [key]: current[key] + 1 }));
  }

  async function toggleSeat(seat) {
    if (!selectedShowtime) return;
    const showtimeId = selectedShowtime.id;
    const isSelected = selectedSeats.some((s) => s.id === seat.id);

    setNotice(null);
    // Cập nhật giao diện ngay, sau đó đồng bộ lại với server
    setSelectedSeats((current) =>
      isSelected ? current.filter((s) => s.id !== seat.id) : [...current, seat]
    );

    pendingRef.current += 1;
    try {
      if (isSelected) {
        await seatAction('releaseSeats', showtimeId, { sessionId: getSessionId(), seatIds: [seat.id] });
      } else {
        const result = await seatAction('holdSeats', showtimeId, {
          sessionId: getSessionId(),
          seatIds: [seat.id],
        });
        setHoldUntil(result.holdUntil);
      }
    } catch (err) {
      needsSyncRef.current = true;
      setNotice({ type: 'error', text: err.message });
    } finally {
      pendingRef.current -= 1;
      // Trạng thái giữ ghế vừa đổi nên cache cũ không còn đúng cho lần mở sau
      invalidateSeats(showtimeId);
      // Giao diện đã cập nhật ngay khi bấm, nên thành công thì không cần tải lại cả sơ đồ ghế
      if (pendingRef.current === 0 && needsSyncRef.current) {
        needsSyncRef.current = false;
        try {
          await refreshSeats(showtimeId);
        } catch (err) {
          console.error('Lỗi khi làm mới sơ đồ ghế:', err);
        }
      }
    }
  }

  // Tên rạp thật của suất đã chọn. Khi xem 'Tất cả rạp' thì lấy từ chính suất chiếu.
  const allCinemas = cinema === ALL_CINEMAS;
  const cinemaName = selectedShowtime?.cinemaName || (allCinemas ? '' : cinema || '');

  function handleContinue() {
    if (!selectedShowtime || selectedSeats.length === 0) return;
    if (typeof onContinue === 'function') {
      handedOffRef.current = true;
      onContinue({
        showtime: selectedShowtime,
        seats: selectedSeats,
        total,
        holdUntil,
        city,
        cinema: cinemaName,
      });
    }
  }

  // Ô tìm rạp chỉ hiện khi thành phố có nhiều rạp
  const showCinemaSearch = cinemas.items.length > 6;
  const visibleCinemas = useMemo(
    () => cinemas.items.filter((c) => matchesText(`${c.name} ${c.address}`, cinemaQuery)),
    [cinemas.items, cinemaQuery]
  );

  // Tên phim có thể do người dùng gõ tự do (Hero Section) nên lọc lại theo từ khóa trước khi gom nhóm
  const matchedShowtimes = useMemo(
    () => showtimes.items.filter((s) => matchesText(s.movieTitle, movieQuery)),
    [showtimes.items, movieQuery]
  );

  // Chỉ lấy các ngày từ hôm nay (theo máy người dùng) trở đi
  const todayKey = localDateKey(now);
  const dayOptions = useMemo(() => {
    const keys = new Set();
    for (const s of matchedShowtimes) {
      const key = dateKeyOf(s.startTime);
      if (key >= todayKey) keys.add(key);
    }
    return Array.from(keys).sort();
  }, [matchedShowtimes, todayKey]);

  const activeDate = selectedDate && dayOptions.includes(selectedDate) ? selectedDate : null;

  const dayShowtimes = useMemo(
    () => (activeDate ? matchedShowtimes.filter((s) => dateKeyOf(s.startTime) === activeDate) : []),
    [matchedShowtimes, activeDate]
  );
  const allPast = dayShowtimes.length > 0 && dayShowtimes.every((s) => new Date(s.startTime).getTime() <= now);

  const grouped = useMemo(() => groupByMovie(dayShowtimes), [dayShowtimes]);
  const seatsByRow = useMemo(() => groupSeatsByRow(seats), [seats]);

  if (!filters) return null;

  const hasSeats = selectedSeats.length > 0;
  if (hasSeats) lastSeatsRef.current = selectedSeats;
  if (holdUntil) lastHoldRef.current = holdUntil;
  const shownSeats = hasSeats ? selectedSeats : lastSeatsRef.current;
  const hasPrice =
    Number(selectedShowtime?.basePrice ?? 0) > 0 || shownSeats.some((s) => typeof s.price === 'number');
  const roomLabel = selectedShowtime?.room ?? '';

  const movieLabel = movieQuery ? `Phim "${movieQuery}"` : '';
  const showtimeSummary = [city, movieLabel].filter(Boolean).join(', ');

  // Chưa có ngày nào phù hợp thì coi như không có kết quả
  const showtimeStatus = showtimes.status === 'ready' && dayOptions.length === 0 ? 'empty' : showtimes.status;

  // Lớp hiệu ứng của vùng nội dung: đang rời đi hoặc đang đi vào
  const stepClass = leaving
    ? leaving === 'forward'
      ? 'sf-out-left'
      : 'sf-out-right'
    : dirRef.current === 'back'
      ? 'sf-in-left'
      : 'sf-in-right';

  const stepKey = step === 4 ? `seats-${selectedShowtime.id}` : `step-${step}`;

  const modal = (
    <div
      className={inline ? 'relative' : 'bm-modal fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6'}
      style={
        inline
          ? undefined
          : {
              opacity: open ? 1 : 0,
              visibility: open ? 'visible' : 'hidden',
              pointerEvents: open ? 'auto' : 'none',
            }
      }
      data-open={open ? 'true' : 'false'}
      aria-hidden={inline ? undefined : !open}
    >
      <style>{`${SEAT_ANIMATIONS}${FLOW_STYLES}`}</style>

      {/* Nền mờ: bấm vào để đóng (chỉ có ở chế độ modal) */}
      {!inline && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />}

      <div
        ref={panelRef}
        role={inline ? undefined : 'dialog'}
        aria-modal={inline ? undefined : 'true'}
        aria-label="Đặt vé xem phim"
        className={
          inline
            ? 'relative flex w-full scroll-mt-24 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-[var(--shadow-low)]'
            : 'bm-modal-panel relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-opaque-separator)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-[var(--shadow-high)]'
        }
      >
        {/* Thanh các bước và nút đóng */}
        <div
          ref={headerRef}
          className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border-separator)] px-5 py-3 sm:px-8"
        >
          <ol className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const isActive = n === step;
              const isDone = n < step;
              // Cùng bảng màu với ghế: đang chọn, ghế đôi (đã qua, bấm được), đã bán (chưa tới)
              const cls = isActive
                ? 'sp-pop border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]'
                : isDone
                  ? 'cursor-pointer border-[var(--color-brand-primary)] bg-[var(--color-bg-primary)] text-[var(--color-brand-primary)] hover:scale-105 hover:bg-[var(--color-fill-tertiary)] active:scale-90'
                  : 'cursor-not-allowed border-transparent bg-[var(--color-fill-tertiary)] text-[var(--color-text-quaternary)]';
              return (
                <li key={label}>
                  <button
                    type="button"
                    disabled={!isDone}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={isDone ? `Quay lại bước ${n}: ${label}` : `Bước ${n}: ${label}`}
                    onClick={() => handleGoToStep(n)}
                    className={`rounded-[var(--radius-sm)] border px-3.5 py-1.5 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${cls}`}
                  >
                    {n} {label}
                  </button>
                </li>
              );
            })}
          </ol>
          {!inline && (
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Đóng"
              onClick={closeModal}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-fill-tertiary)] hover:text-[var(--color-text-primary)] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          )}
        </div>

        {/* Khung nội dung: chiều cao chạy mượt theo nội dung bên trong */}
        <div
          ref={scrollRef}
          className={`sf-body min-h-0 ${inline ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}
          style={bodyHeight != null ? { height: bodyHeight } : undefined}
          aria-live="polite"
        >
          <div ref={innerRef} className="px-5 py-6 sm:px-8 sm:py-8">
            <div key={stepKey} className={stepClass}>
              {notice && (
                <p
                  role="alert"
                  className="bm-rise mb-4 rounded-[var(--radius-md)] border border-[var(--color-system-error)]/40 bg-[var(--color-system-error)]/10 px-4 py-3 text-[13px] font-medium text-[var(--color-system-error)]"
                >
                  {notice.text}
                </p>
              )}

              {/* BƯỚC 1: chọn thành phố */}
              {step === 1 && (
                <div>
                  <StepHeading title="Chọn thành phố" subtitle={movieLabel} />

                  <div className="mt-6">
                    {(cities.status === 'loading' || cities.status === 'idle') && (
                      <CardSkeleton count={8} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" label="Đang tải thành phố" />
                    )}

                    {cities.status === 'error' && (
                      <ListMessage tone="error" onRetry={() => retry('cities')}>
                        Không tải được danh sách thành phố. Kiểm tra backend rồi thử lại.
                      </ListMessage>
                    )}

                    {cities.status === 'empty' && (
                      <ListMessage>Hiện chưa có thành phố nào đang chiếu phim này.</ListMessage>
                    )}

                    {cities.status === 'ready' && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {cities.items.map((item, i) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => handleChooseCity(item)}
                            style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
                            className="bm-rise group flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] px-4 py-4 text-left text-[14px] font-semibold text-[var(--color-text-primary)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <PinIcon />
                              <span className="truncate">{item.name}</span>
                            </span>
                            <ChevronIcon />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BƯỚC 2: chọn rạp chiếu */}
              {step === 2 && (
                <div>
                  <StepHeading
                    title={`Chọn rạp tại ${city}`}
                    subtitle={movieLabel}
                    backLabel="Đổi thành phố"
                    onBack={() => handleBackTo(1)}
                  />

                  <div className="mt-6">
                    {(cinemas.status === 'loading' || cinemas.status === 'idle') && (
                      <CardSkeleton count={6} className="sm:grid-cols-2" label="Đang tải rạp chiếu" />
                    )}

                    {cinemas.status === 'error' && (
                      <ListMessage tone="error" onRetry={() => retry('cinemas')}>
                        Không tải được danh sách rạp. Kiểm tra backend rồi thử lại.
                      </ListMessage>
                    )}

                    {cinemas.status === 'empty' && (
                      <ListMessage>
                        Chưa có rạp nào chiếu phim này tại {city}. Hãy thử chọn thành phố khác.
                      </ListMessage>
                    )}

                    {cinemas.status === 'ready' && (
                      <div>
                        {showCinemaSearch && (
                          <input
                            type="search"
                            value={cinemaQuery}
                            onChange={(e) => setCinemaQuery(e.target.value)}
                            placeholder="Tìm rạp theo tên hoặc địa chỉ"
                            aria-label="Tìm rạp chiếu"
                            className="bm-rise mb-4 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] px-3 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-colors focus-visible:border-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                          />
                        )}

                        {visibleCinemas.length === 0 ? (
                          <ListMessage>Không có rạp nào khớp với từ khóa.</ListMessage>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {visibleCinemas.map((item, i) => (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => handleChooseCinema(item)}
                                style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
                                className="bm-rise group flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] px-4 py-4 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <PinIcon />
                                  <span className="min-w-0">
                                    <span className="block truncate text-[14px] font-semibold text-[var(--color-text-primary)]">
                                      {item.name}
                                    </span>
                                    {item.address && (
                                      <span className="mt-0.5 block truncate text-[12px] text-[var(--color-text-secondary)]">
                                        {item.address}
                                      </span>
                                    )}
                                  </span>
                                </span>
                                <ChevronIcon />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BƯỚC 3: chọn suất chiếu */}
              {step === 3 && (
                <div>
                  <StepHeading
                    title={allCinemas ? `Suất chiếu tại ${city}` : `Suất chiếu tại ${cinema}`}
                    subtitle={showtimeSummary}
                    backLabel="Đổi rạp"
                    onBack={() => handleBackTo(2)}
                  />

                  <div className="mt-6">
                    {(showtimeStatus === 'loading' || showtimeStatus === 'idle') && <ShowtimeSkeleton />}

                    {showtimeStatus === 'error' && (
                      <ListMessage tone="error" onRetry={() => retry('showtimes')}>
                        Không tải được suất chiếu. Kiểm tra backend rồi thử lại.
                      </ListMessage>
                    )}

                    {showtimeStatus === 'empty' && (
                      <ListMessage>
                        {allCinemas
                          ? 'Chưa có suất chiếu phù hợp. Hãy thử chọn thành phố hoặc tên phim khác.'
                          : 'Rạp này chưa có suất chiếu phù hợp. Hãy thử chọn rạp khác.'}
                      </ListMessage>
                    )}

                    {showtimeStatus === 'ready' && (
                      <div>
                        {/* Chọn ngày: chỉ hiện các ngày từ hôm nay có suất chiếu của phim đã tìm */}
                        <p className="mb-2 text-[13px] font-semibold">Chọn ngày xem</p>
                        <div
                          ref={dayStripRef}
                          role="radiogroup"
                          aria-label="Chọn ngày xem"
                          className="-mx-2 -mt-2 flex gap-2 overflow-x-auto overscroll-x-contain px-2 pb-3 pt-2"
                        >
                          {dayOptions.map((key, i) => {
                            const [y, m, d] = key.split('-').map(Number);
                            const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
                            const isToday = key === todayKey;
                            const isActive = key === activeDate;
                            return (
                              <button
                                key={key}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => setSelectedDate(key)}
                                style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
                                className={`bm-rise flex min-w-[68px] shrink-0 flex-col items-center rounded-[var(--radius-sm)] border px-3 py-2 transition-all duration-200 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
                                  isActive
                                    ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]'
                                    : 'border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)]'
                                }`}
                              >
                                <span className={`text-[11px] ${isActive ? '' : 'text-[var(--color-text-secondary)]'}`}>
                                  {isToday ? 'Hôm nay' : weekday}
                                </span>
                                <span className="text-[20px] font-bold leading-tight">{d}</span>
                                <span className={`text-[11px] ${isActive ? '' : 'text-[var(--color-text-secondary)]'}`}>
                                  Th{m}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Suất chiếu của ngày đang chọn. key theo ngày để đổi ngày thì danh sách chạy lại hiệu ứng */}
                        {!activeDate ? (
                          <p className="bm-rise mt-4 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-separator)] p-5 text-center text-[13px] text-[var(--color-text-secondary)]">
                            Chọn một ngày để xem các suất chiếu.
                          </p>
                        ) : (
                          <div key={activeDate} className="mt-4 flex flex-col gap-4">
                            {allPast && (
                              <p className="bm-rise text-[12px] text-[var(--color-text-secondary)]">
                                Các suất chiếu của ngày này đã qua giờ. Hãy chọn ngày khác.
                              </p>
                            )}
                            {grouped.map(([title, items], groupIndex) => (
                              <div
                                key={title}
                                className="bm-rise rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4"
                                style={{ animationDelay: `${groupIndex * 90}ms` }}
                              >
                                <h3 className="mb-3 text-[15px] font-semibold">{title}</h3>
                                <div className="flex flex-wrap gap-2">
                                  {items.map((s) => {
                                    const isPast = new Date(s.startTime).getTime() <= now;
                                    // Một rạp cụ thể thì chỉ cần phòng chiếu, xem tất cả rạp thì phải hiện thêm tên rạp
                                    const subLabel = allCinemas
                                      ? [s.cinemaName, s.room].filter(Boolean).join(', ')
                                      : s.room || s.cinemaName;
                                    return (
                                      <button
                                        key={s.id}
                                        type="button"
                                        disabled={isPast}
                                        title={isPast ? 'Suất chiếu đã qua giờ' : undefined}
                                        onClick={() => handleChooseShowtime(s)}
                                        className="flex min-w-[88px] flex-col items-center rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-[var(--color-border-separator)] disabled:active:scale-100"
                                      >
                                        <span className={`font-semibold ${isPast ? 'line-through' : ''}`}>
                                          {formatTime(s.startTime)}
                                        </span>
                                        {subLabel && (
                                          <span className="text-[11px] text-[var(--color-text-secondary)]">
                                            {subLabel}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BƯỚC 4: chọn ghế */}
              {step === 4 && selectedShowtime && (
                <div>
                  <StepHeading
                    title="Chọn ghế"
                    subtitle="Chọn chỗ ngồi của bạn. Tổng tiền được cập nhật ngay khi chọn ghế."
                    backLabel="Đổi suất chiếu"
                    onBack={() => handleBackTo(3)}
                  />

                  {/* Thẻ thông tin phim */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold">{selectedShowtime.movieTitle}</p>
                      <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">{cinemaName}</p>
                    </div>
                    <p className="text-[13px] text-[var(--color-text-secondary)]">
                      {formatLongDate(selectedShowtime.startTime)} · {formatTime(selectedShowtime.startTime)}
                      {roomLabel ? ` · ${roomLabel}` : ''}
                    </p>
                  </div>

                  <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    {/* Cột trái: sơ đồ ghế */}
                    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-primary)] p-5 sm:p-8">
                      <SeatPicker
                        loadingSeats={loadingSeats}
                        seatsByRow={seatsByRow}
                        selectedSeats={selectedSeats}
                        onToggleSeat={toggleSeat}
                      />
                    </div>

                    {/* Cột phải: Vé của bạn và tổng tiền */}
                    <aside className="rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-primary)] p-6 lg:sticky lg:top-0">
                      <h3 className="text-[17px] font-semibold">Vé của bạn</h3>

                      <div className="mt-4 border-t border-[var(--color-border-separator)] pt-4">
                        <p className="text-[14px] font-semibold">{selectedShowtime.movieTitle}</p>
                        <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{cinemaName}</p>
                        <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
                          {formatDate(dateKeyOf(selectedShowtime.startTime))} · {formatTime(selectedShowtime.startTime)}
                          {roomLabel ? ` · ${roomLabel}` : ''}
                        </p>
                      </div>

                      {/* Ghế đã chọn: mỗi ghế bật lên (sp-pop) như khi chọn trên sơ đồ, vùng giãn ra, co lại mượt bằng bm-reveal */}
                      <div className="mt-4 border-t border-[var(--color-border-separator)] pt-4">
                        <p className="text-[12px] text-[var(--color-text-secondary)]">Ghế đã chọn</p>

                        <div className="bm-reveal" data-open={!hasSeats}>
                          <div className="bm-reveal-inner">
                            <p className="mt-1 text-[14px] font-semibold text-[var(--color-brand-primary)]">
                              Chưa chọn ghế
                            </p>
                          </div>
                        </div>

                        <div className="bm-reveal" data-open={hasSeats}>
                          <div className="bm-reveal-inner">
                            <ul className="flex flex-wrap gap-1.5 p-1">
                              {shownSeats.map((s) => (
                                <li
                                  key={s.id}
                                  className="sp-pop rounded-[var(--radius-xs)] border border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] px-2 py-1 text-[12px] font-bold text-[var(--color-brand-on-primary)] shadow-[var(--shadow-low)]"
                                >
                                  {seatName(s)}
                                </li>
                              ))}
                            </ul>
                            {hasPrice && (
                              <ul className="mt-2 space-y-1 text-[12px] text-[var(--color-text-secondary)]">
                                {shownSeats.map((s) => (
                                  <li key={s.id} className="sp-fade flex justify-between">
                                    <span>
                                      {seatName(s)}
                                      {s.type && s.type !== 'STANDARD' ? ` (${s.type})` : ''}
                                    </span>
                                    <span>{formatVND(getSeatPrice(s, selectedShowtime))}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-[var(--color-border-separator)] pt-4">
                        <p className="text-[12px] text-[var(--color-text-secondary)]">Tổng cộng</p>
                        <p className="mt-1 text-[28px] font-bold text-[var(--color-brand-primary)]">
                          <AnimatedPrice value={total} />
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
                          {hasPrice
                            ? 'Giá vé được hiển thị minh bạch trước khi xác nhận.'
                            : 'Chưa có giá vé cho suất chiếu này.'}
                        </p>
                        <div className="bm-reveal" data-open={hasSeats && Boolean(holdUntil)}>
                          <div className="bm-reveal-inner">
                            <p className="mt-2 text-[12px] text-[var(--color-text-tertiary)]">
                              {lastHoldRef.current
                                ? `Giữ ghế đến ${formatTime(lastHoldRef.current)}. Quá giờ này ghế sẽ tự động được trả lại.`
                                : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!hasSeats}
                        className="mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] text-[13px] font-semibold text-[var(--color-brand-on-primary)] transition-all duration-200 hover:bg-[var(--color-brand-primary-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
                      >
                        Tiếp tục
                        <span aria-hidden="true">→</span>
                      </button>
                      <p className="mt-3 text-center text-[12px] text-[var(--color-text-tertiary)]">
                        Bạn có thể quay lại để đổi ghế trước khi thanh toán.
                      </p>
                    </aside>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Nội tuyến: render ngay tại vị trí đặt component.
  // Modal: render qua portal để lớp nền mờ luôn phủ kín toàn màn hình, không bị ảnh hưởng bởi thẻ cha.
  if (inline) return modal;
  // Modal chỉ mở sau tương tác trên trình duyệt nên document luôn tồn tại ở đây.
  return typeof document === 'undefined' ? null : createPortal(modal, document.body);
}

// Tiêu đề của mỗi bước, kèm nút quay lại bước trước (nếu có)
function StepHeading({ title, subtitle, backLabel, onBack }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[24px] font-bold">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{subtitle}</p>}
      </div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-semibold text-[var(--color-brand-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
        >
          {backLabel}
        </button>
      )}
    </div>
  );
}

// Thông báo trống hoặc lỗi của một danh sách, có thể kèm nút Thử lại
function ListMessage({ tone = 'muted', onRetry, children }) {
  return (
    <div className="bm-rise rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-5 text-center">
      <p
        className={`text-[13px] ${
          tone === 'error' ? 'text-[var(--color-system-error)]' : 'text-[var(--color-text-secondary)]'
        }`}
      >
        {children}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-[var(--radius-sm)] border border-[var(--color-brand-primary)] px-4 py-1.5 text-[13px] font-semibold text-[var(--color-brand-primary)] transition-all hover:bg-[var(--color-fill-tertiary)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 18s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" />
      <circle cx="10" cy="8" r="2.2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-brand-primary)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.5 4.5L13 10l-5.5 5.5" />
    </svg>
  );
}

// Khung chờ cho danh sách thẻ (thành phố, rạp)
function CardSkeleton({ count, className = '', label }) {
  return (
    <div className={`grid gap-3 ${className}`} role="status" aria-label={label}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-[58px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-fill-tertiary)]"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

function ShowtimeSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Đang tải suất chiếu">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4"
        >
          <div className="mb-4 h-4 w-48 animate-pulse rounded-[var(--radius-xs)] bg-[var(--color-fill-secondary)]" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <span
                key={j}
                className="h-[52px] w-[88px] animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-fill-tertiary)]"
                style={{ animationDelay: `${(i + j) * 80}ms` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}