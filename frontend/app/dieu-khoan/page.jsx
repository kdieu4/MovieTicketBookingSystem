import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Điều khoản & Quy định | Seenema',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      <main className="animate-fade-in w-full flex-1 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-b border-[var(--color-border-separator)] pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Điều khoản & Quy định</h1>
          <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">Cập nhật lần cuối: Tháng 10 năm 2026</p>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">1. Chấp thuận điều khoản</h2>
            <p className="mt-2">
              Khi truy cập và sử dụng dịch vụ đặt vé của Seenema, người dùng đồng ý tuân thủ toàn bộ các quy định, điều khoản được nêu tại đây. Nếu không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">2. Quy định về đặt vé và thanh toán</h2>
            <p className="mt-2">
              Người dùng có trách nhiệm kiểm tra kỹ các thông tin bao gồm: tên phim, rạp chiếu, suất chiếu, số lượng vé và vị trí ghế trước khi xác nhận thanh toán. Giao dịch đã hoàn tất thành công sẽ không được hủy hoặc hoàn tiền theo chính sách hệ thống.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">3. Quy định về giới hạn độ tuổi</h2>
            <p className="mt-2">
              Khách hàng phải tuân thủ phân loại độ tuổi xem phim theo quy định của Bộ Văn hóa, Thể thao và Du lịch:
            </p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>P: Phim được phép phổ biến đến mọi lứa tuổi.</li>
              <li>K: Phim được phổ biến đến người xem dưới 13 tuổi với điều kiện xem cùng cha mẹ hoặc người giám hộ.</li>
              <li>T13: Phim phổ biến đến người xem từ đủ 13 tuổi trở lên.</li>
              <li>T16: Phim phổ biến đến người xem từ đủ 16 tuổi trở lên.</li>
              <li>T18: Phim phổ biến đến người xem từ đủ 18 tuổi trở lên.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">4. Bảo mật thông tin</h2>
            <p className="mt-2">
              Seenema cam kết bảo vệ thông tin cá nhân và dữ liệu thanh toán của khách hàng theo chuẩn mã hóa quốc tế. Chúng tôi không chia sẻ dữ liệu cho bên thứ ba ngoại trừ trường hợp có yêu cầu từ cơ quan pháp luật.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}