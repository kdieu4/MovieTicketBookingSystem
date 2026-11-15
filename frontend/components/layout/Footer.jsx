import Link from 'next/link';
import { BRAND_NAME } from '@/styles/tokens';

const SUPPORT_LINKS = [
  { label: 'Hướng dẫn đặt vé', href: '/huong-dan-dat-ve' },
  { label: 'Câu hỏi thường gặp', href: '/faq' },
  { label: 'Điều khoản', href: '/dieu-khoan' },
  { label: 'Hỗ trợ', href: '/ho-tro' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Một hàng gọn: thương hiệu – liên kết – liên hệ, thay cho 2 cột cao trước đây. */}
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-[var(--color-text-primary)] transition-opacity hover:opacity-70"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-brand-primary)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-brand-fill)]" />
            </span>
            {BRAND_NAME}
          </Link>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[var(--color-text-secondary)]">
            <a href="tel:19006868" className="transition-colors hover:text-[var(--color-text-primary)]">
              1900 6868
            </a>
            <a href="mailto:support@seenema.vn" className="transition-colors hover:text-[var(--color-text-primary)]">
              support@seenema.vn
            </a>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1 border-t border-[var(--color-border-separator)] pt-4 text-xs text-[var(--color-text-tertiary)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {BRAND_NAME}. Bảo lưu mọi quyền.</span>
          <span>Giờ hỗ trợ 8:00 – 22:00 mỗi ngày.</span>
        </div>
      </div>
    </footer>
  );
}
