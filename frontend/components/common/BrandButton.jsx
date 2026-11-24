'use client';

import { GlassActionButton, GlassButton } from '@/components/liquid-glass';

// Hai biến CSS của kit: kính trong suốt tô đúng mã màu thương hiệu, đổi sang mã hover khi rê chuột.
// Dùng material="clear" + tint=1 thay cho "tinted": tinted lấy màu nền của chính nút rồi pha với
// ánh sáng của kính nên ra xanh đậm/lạt hơn #0066cc của trang.
const BRAND = '[--glass-tint:#0066cc] hover:[--glass-tint:#0055b3]';

/**
 * GlassButton nền xanh thương hiệu, đúng màu --color-brand-fill.
 * Nhận đủ props của GlassButton (asChild, size, icon, ...).
 */
export function BrandGlassButton({ className = '', ...rest }) {
  return <GlassButton material="clear" tint={1} className={`${BRAND} ${className}`} {...rest} />;
}

/** GlassActionButton cùng chất liệu xanh thương hiệu (cho thao tác async như thanh toán). */
export function BrandGlassActionButton({ className = '', ...rest }) {
  return <GlassActionButton material="clear" tint={1} className={`${BRAND} ${className}`} {...rest} />;
}

export default BrandGlassButton;
