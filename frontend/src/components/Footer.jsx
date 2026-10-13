import { BRAND_NAME } from '../styles/tokens';

const FOOTER_LINKS = [
  { label: 'Hướng dẫn đặt vé', href: '/huong-dan-dat-ve' },
  { label: 'Câu hỏi thường gặp', href: '/faq' },
  { label: 'Điều khoản', href: '/dieu-khoan' },
  { label: 'Hỗ trợ', href: '/ho-tro' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border-separator)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-[var(--color-text-tertiary)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span className="font-medium text-[var(--color-text-primary)]">{BRAND_NAME}</span>

        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[var(--color-text-primary)]">
              {link.label}
            </a>
          ))}
        </nav>

        <span>© {year} {BRAND_NAME} Cinema</span>
      </div>
    </footer>
  );
}