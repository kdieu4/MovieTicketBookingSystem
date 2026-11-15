import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Hướng dẫn đặt vé | Seenema',
};

const STEPS = [
  {
    step: '01',
    title: 'Chọn phim & Suất chiếu',
    desc: 'Chọn phim, rạp, ngày và giờ chiếu phù hợp với bạn.',
  },
  {
    step: '02',
    title: 'Chọn vị trí ghế & Combo',
    desc: 'Chọn ghế trên sơ đồ phòng chiếu và thêm combo bắp nước nếu muốn.',
  },
  {
    step: '03',
    title: 'Thanh toán an toàn',
    desc: 'Kiểm tra vé, áp mã giảm giá và thanh toán bằng ví, thẻ hoặc QR.',
  },
  {
    step: '04',
    title: 'Nhận vé điện tử (QR Code)',
    desc: 'Mã QR hiện ngay trên màn hình và gửi về email; xuất trình tại rạp.',
  },
];

export default function BookingGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      <main className="animate-fade-in mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-[var(--color-fill-secondary)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
            Trợ giúp
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Hướng dẫn đặt vé trực tuyến</h1>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-5 shadow-[var(--shadow-low)] transition-all hover:border-[var(--color-border-opaque-separator)] hover:shadow-[var(--shadow-medium)]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-primary-container)] text-xs font-semibold text-[var(--color-brand-primary)]">
                {item.step}
              </span>
              <h2 className="mt-3 text-base font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] p-6 sm:p-7">
          <h2 className="text-lg font-semibold tracking-tight">Lưu ý quan trọng khi nhận vé</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            <li>Bạn vui lòng đến rạp trước giờ chiếu từ 15 - 20 phút để soát vé và nhận combo bắp nước.</li>
            <li>Xuất trình trực tiếp mã QR trên ứng dụng hoặc email, không cần in vé giấy.</li>
            <li>Đảm bảo mang theo giấy tờ tùy thân có ảnh để đối chiếu độ tuổi đối với các phim có giới hạn độ tuổi (T18, T16, T13).</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}