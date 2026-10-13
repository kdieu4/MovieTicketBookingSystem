import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SupportPage() {
  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-[var(--color-fill-secondary)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
              Liên hệ 24/7
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Trung tâm hỗ trợ khách hàng</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 shadow-[var(--shadow-low)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-primary-container)] text-[var(--color-brand-primary)] font-bold text-sm">
                  TEL
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Hotline hỗ trợ (8:00 - 22:00)</p>
                  <p className="text-sm font-semibold">1900 6868</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-4 shadow-[var(--shadow-low)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-primary-container)] text-[var(--color-brand-primary)] font-bold text-sm">
                  MAIL
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Email hỗ trợ khách hàng</p>
                  <p className="text-sm font-semibold">support@seenema.vn</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-translucent-card)] p-6 shadow-[var(--shadow-medium)] backdrop-blur-xl sm:p-8">
            <h2 className="text-lg font-bold tracking-tight">Gửi yêu cầu hỗ trợ</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Email liên hệ</label>
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Nội dung cần hỗ trợ</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Mô tả chi tiết sự cố hoặc thắc mắc của bạn..."
                  className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)] text-sm font-semibold text-[var(--color-brand-on-primary)] transition-all hover:bg-[var(--color-brand-primary-hover)] active:scale-95"
              >
                Gửi yêu cầu
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}