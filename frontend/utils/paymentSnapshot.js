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


