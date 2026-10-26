import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Ưu đãi thành viên | Seenema',
};

const OFFERS = [
  {
    step: '01',
    title: 'Tích điểm mỗi lần đặt vé',
    desc: 'Điểm thưởng được cộng tự động vào tài khoản sau khi thanh toán thành công. Theo dõi số điểm và ngày hết hạn trong mục Thông tin cá nhân.',
  },
  {
    step: '02',
    title: 'Thanh toán linh hoạt',
    desc: 'Hỗ trợ thẻ ATM nội địa, Visa, MasterCard, JCB cùng ví điện tử VNPAY-QR, Momo, ZaloPay và ShopeePay. Mỗi giao dịch áp dụng tối đa một mã ưu đãi.',
  },
  {
    step: '03',
    title: 'Đặt vé cho cả nhóm',
    desc: 'Mỗi giao dịch đặt được tối đa 8 ghế trong cùng suất chiếu. Cần số lượng lớn hơn cho nhóm hoặc doanh nghiệp, hãy liên hệ bộ phận chăm sóc khách hàng.',
  },
];

export default function OffersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />

      <main className="animate-fade-in mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-[var(--color-fill-secondary)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
            Thành viên
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Ưu đãi tại Seenema</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Những quyền lợi dành cho khách hàng đặt vé trực tuyến, từ tích điểm đến thanh toán và đặt vé nhóm.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((offer, index) => (
            <article
              key={offer.step}
              style={{ animationDelay: `${index * 70}ms` }}
              className="animate-fade-in flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-low)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-opaque-separator)] hover:shadow-[var(--shadow-medium)]"
            >
              <span className="text-2xl font-semibold text-[var(--color-brand-primary)]">{offer.step}</span>
              <h2 className="mt-4 text-base font-semibold tracking-tight">{offer.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{offer.desc}</p>
            </article>
          ))}
        </div>

        <section className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Sẵn sàng chọn phim?</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Xem lịch chiếu và đặt vé tại rạp gần bạn.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/phim"
              className="inline-flex h-10 items-center rounded-full bg-[var(--color-brand-fill)] px-5 text-sm font-semibold text-[var(--color-brand-on-primary)] transition-colors hover:bg-[var(--color-brand-fill-hover)] active:scale-95"
            >
              Xem phim
            </Link>
            <Link
              href="/ho-tro"
              className="inline-flex h-10 items-center rounded-full border border-[var(--color-border-separator)] bg-[var(--color-bg-primary)] px-5 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)] active:scale-95"
            >
              Liên hệ hỗ trợ
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
