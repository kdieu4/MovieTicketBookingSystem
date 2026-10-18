import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Hướng dẫn đặt vé | Seenema',
};

const STEPS = [
  {
    step: '01',
    title: 'Chọn phim & Suất chiếu',
    desc: 'Duyệt danh sách phim đang chiếu tại trang chủ hoặc trang Phim. Lựa chọn rạp chiếu, ngày xem và khung giờ phù hợp với lịch trình của bạn.',
  },
  {
    step: '02',
    title: 'Chọn vị trí ghế & Combo',
    desc: 'Sơ đồ phòng chiếu hiển thị thời gian thực. Chọn ghế mong muốn (Ghế Thường, VIP, Couples) và bổ sung các gói bắp nước ưu đãi.',
  },
  {
    step: '03',
    title: 'Thanh toán an toàn',
    desc: 'Kiểm tra lại thông tin vé, áp dụng mã giảm giá (nếu có) và lựa chọn phương thức thanh toán linh hoạt qua Ví điện tử, Thẻ ngân hàng hoặc QR Code.',
  },
  {
    step: '04',
    title: 'Nhận vé điện tử (QR Code)',
    desc: 'Sau khi thanh toán thành công, mã QR vé điện tử sẽ hiển thị ngay trên màn hình và gửi về Email. Xuất trình mã QR tại rạp để vào phòng chiếu.',
  },
];

export default function BookingGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      <main className="animate-fade-in w-full flex-1 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-[var(--color-fill-secondary)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
            Trợ giúp
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Hướng dẫn đặt vé trực tuyến</h1>
          <p className="mt-2 text-base text-[var(--color-text-secondary)]">
            Chỉ với 4 bước đơn giản để sở hữu tấm vé xem phim yêu thích tại Seenema.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] p-6 shadow-[var(--shadow-low)] transition-all hover:border-[var(--color-border-opaque-separator)] hover:shadow-[var(--shadow-medium)]"
            >
              <div>
                <span className="text-2xl font-bold text-[var(--color-brand-primary)]">{item.step}</span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-secondary)] p-6 sm:p-8">
          <h2 className="text-lg font-bold tracking-tight">Lưu ý quan trọng khi nhận vé</h2>
          <ul className="mt-4 space-y-2.5 text-xs text-[var(--color-text-secondary)] list-disc pl-5">
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