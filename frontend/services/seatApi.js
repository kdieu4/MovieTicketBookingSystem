const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083/api';
const SESSION_KEY = 'mtbs-booking-session-id';

// Sơ đồ ghế được làm mới mỗi 15 giây khi đang mở, nên cache 10 giây không làm dữ liệu cũ hơn hiện tại.
// shortcut: trạng thái ghế có thể trễ tối đa 10 giây, đổi sang kiểm tra realtime nếu cần chính xác tuyệt đối.
const CACHE_TTL_MS = 10_000;

const cache = new Map();
const inflight = new Map();

export function getSessionId() {
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getCachedSeats(showtimeId) {
  const hit = cache.get(String(showtimeId));
  return hit && Date.now() - hit.at < CACHE_TTL_MS ? hit.list : null;
}

export function invalidateSeats(showtimeId) {
  if (showtimeId) cache.delete(String(showtimeId));
}

async function requestSeats(showtimeId, signal) {
  const params = new URLSearchParams({
    showtimeId: String(showtimeId),
    sessionId: getSessionId(),
  });
  const res = await fetch(`${API_BASE_URL}/getSeatsByShowtime?${params}`, {
    signal,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function loadSeats(showtimeId, signal) {
  const key = String(showtimeId);
  const cached = getCachedSeats(key);
  if (cached) return Promise.resolve(cached);
  if (inflight.has(key)) return inflight.get(key);

  const promise = requestSeats(key, signal)
    .then((list) => {
      cache.set(key, { list, at: Date.now() });
      return list;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}


