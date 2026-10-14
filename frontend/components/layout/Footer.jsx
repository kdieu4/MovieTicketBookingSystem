import Link from 'next/link';
import { BRAND_NAME } from '@/styles/tokens';

const FOOTER_LINKS = [
  { label: 'Hướng dẫn đặt vé', href: '/huong-dan-dat-ve' },
  { label: 'Câu hỏi thường gặp', href: '/faq' },
  { label: 'Điều khoản', href: '/dieu-khoan' },
  { label: 'Hỗ trợ', href: '/ho-tro' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border-separator)] bg-[var(--color-bg-primary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-[var(--color-text-tertiary)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="font-semibold tracking-tight text-[var(--color-text-primary)] hover:opacity-80">
          {BRAND_NAME} Cinema
        </Link>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--color-text-primary)]">
              {link.label}
            </Link>
          ))}
        </nav>

        <span>© {year} {BRAND_NAME}. Bảo lưu mọi quyền.</span>
      </div>
    </footer>
  );
}