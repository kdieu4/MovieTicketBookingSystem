'use client';

import { Button } from 'glisse';

/**
 * Nút mở thêm hàng cho các danh sách dài, dùng đúng nút kính của glisse như
 * nút "Đặt vé" (glass + nền xanh thương hiệu) để cả trang chỉ có một kiểu nút.
 */
export default function ShowMoreButton({ onClick }) {
  return (
    <div className="mt-8 flex justify-center border-t border-[var(--color-border-separator)] pt-6">
      <Button
        type="button"
        variant="filled"
        onClick={onClick}
        style={{ height: 40, borderRadius: 20, padding: '0 22px', fontSize: 13 }}
      >
        Xem thêm
      </Button>
    </div>
  );
}
