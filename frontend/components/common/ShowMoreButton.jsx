'use client';

import { BrandGlassButton } from '@/components/common/BrandButton';

/**
 * Nút mở thêm hàng cho các danh sách dài, dùng nút kính liquid-glass để đồng bộ
 * với nút "Đặt vé" trên card phim.
 */
export default function ShowMoreButton({ onClick }) {
  return (
    <div className="mt-8 flex justify-center">
      <BrandGlassButton
        type="button"
        size="md"
        onClick={onClick}
        className="bg-[var(--color-brand-fill)] text-[var(--color-brand-on-primary)]"
        style={{ fontSize: 13 }}
      >
        Xem thêm
      </BrandGlassButton>
    </div>
  );
}
