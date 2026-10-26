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
    <footer className="mt-16 border-t border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-[var(--color-text-primary)] transition-opacity hover:opacity-70"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-brand-primary)]">
                <span className="h-3 w-3 rounded-full bg-[var(--color-brand-fill)]" />
              </span>
              {BRAND_NAME}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Đặt vé xem phim trực tuyến, chọn ghế và nhận vé điện tử ngay tại Seenema.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-[var(--color-text-primary)]">Hỗ trợ</h2>
            <ul className="mt-4 flex flex-wrap gap-x-7 gap-y-2.5 text-sm">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-1 text-sm text-[var(--color-text-secondary)]">
              <a href="tel:19006868" className="transition-colors hover:text-[var(--color-text-primary)]">
                1900 6868
              </a>
              <a href="mailto:support@seenema.vn" className="transition-colors hover:text-[var(--color-text-primary)]">
                support@seenema.vn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--color-border-separator)] pt-6 text-xs text-[var(--color-text-tertiary)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {BRAND_NAME}. Bảo lưu mọi quyền.</span>
          <span>Giờ hỗ trợ 8:00 – 22:00 mỗi ngày.</span>
        </div>
      </div>
    </footer>
  );
}
