// Lưu tạm trạng thái bước "Xác nhận" trước khi rời trang sang VNPay.
// Mục đích: sau khi VNPay redirect về, khôi phục lại đúng màn hình xác nhận
// (thành phố, rạp, suất chiếu, ghế, booking) thay vì đẩy người dùng sang trang khác.

const STORAGE_KEY = "mtbs_pending_payment";
const MAX_AGE_MS = 30 * 60 * 1000; // Quá 30 phút thì coi như phiên cũ

export function savePaymentSnapshot(data) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, savedAt: Date.now() }),
    );
  } catch {
    // Hết dung lượng hoặc bị chặn: bỏ qua, luồng thanh toán vẫn chạy bình thường
  }
}

export function readPaymentSnapshot() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

    if (!data?.savedAt || Date.now() - data.savedAt > MAX_AGE_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function clearPaymentSnapshot() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Không xóa được thì thôi, snapshot sẽ tự hết hạn
  }
}

// URL quay về sau khi thanh toán xong: đúng trang đã đặt vé + cờ payment=success
// để BookingFlow biết cần khôi phục bước xác nhận và chạy hiệu ứng.
export function paymentReturnUrl(snapshot) {
  // Đặt vé nhanh từ trang chủ (modal): quay lại trang chủ kèm thông tin phim để
  // mở lại đúng modal đó, thay vì đẩy người dùng sang giao diện trong trang phim.
  if (snapshot?.variant === "modal" && snapshot?.movieTitle) {
    const params = new URLSearchParams();

    params.set("payment", "success");
    params.set("movieTitle", snapshot.movieTitle);

    if (snapshot.bookingId) params.set("booking", String(snapshot.bookingId));
    if (snapshot.filterCity) params.set("city", snapshot.filterCity);
    if (snapshot.filterCinema) params.set("cinema", snapshot.filterCinema);

    return `/?${params.toString()}`;
  }

  // Đặt vé trong trang phim là nơi BookingFlow luôn dựng được bước xác nhận
  // (nó có sẵn filters theo phim).
  if (snapshot?.movieId) {
    return `/phim/${snapshot.movieId}?payment=success`;
  }

  // Không có snapshot (ví dụ thanh toán từ trang Vé của tôi): giữ nguyên hành vi cũ
  if (!snapshot?.pathname) return "/ve-cua-toi";

  // Trang chủ mất filters khi tải lại nên không dựng lại được bước xác nhận,
  // đưa về danh sách vé thay vì để người dùng ở trang chủ mà không thấy gì.
  if (snapshot.pathname === "/") return "/ve-cua-toi";

  const params = new URLSearchParams(snapshot.search || "");

  params.set("payment", "success");

  if (snapshot.bookingId) {
    params.set("booking", String(snapshot.bookingId));
  }

  return `${snapshot.pathname}?${params.toString()}`;
}
