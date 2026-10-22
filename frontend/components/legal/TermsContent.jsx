export default function TermsContent() {
  return (
    <div className="space-y-7 text-sm leading-relaxed text-[var(--color-text-secondary)]">
      <p>
        Chào mừng bạn đến với Seenema. Các điều khoản dưới đây quy định quyền và nghĩa vụ của bạn khi
        truy cập, tạo tài khoản và sử dụng dịch vụ đặt vé trực tuyến của Seenema.
      </p>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">1. Chấp thuận điều khoản</h2>
        <p className="mt-2">
          Khi truy cập, tạo tài khoản hoặc sử dụng dịch vụ của Seenema, bạn xác nhận đã đọc, hiểu và
          đồng ý tuân thủ toàn bộ các quy định được nêu tại đây. Nếu không đồng ý với bất kỳ điều khoản
          nào, vui lòng ngừng sử dụng dịch vụ.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">2. Tài khoản và bảo mật</h2>
        <p className="mt-2">
          Bạn có trách nhiệm cung cấp thông tin chính xác, đầy đủ và cập nhật kịp thời khi có thay đổi.
          Bạn cần bảo mật thông tin đăng nhập, không chia sẻ tài khoản cho người khác và thông báo ngay
          cho Seenema khi phát hiện truy cập trái phép.
        </p>
        <p className="mt-2">
          Seenema có thể tạm khóa hoặc chấm dứt tài khoản có thông tin giả mạo, có dấu hiệu gian lận
          hoặc vi phạm các điều khoản này.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">3. Đặt vé và thanh toán</h2>
        <p className="mt-2">
          Người dùng có trách nhiệm kiểm tra kỹ tên phim, rạp, suất chiếu, số lượng vé và vị trí ghế
          trước khi xác nhận thanh toán. Giá vé và các khoản phí (nếu có) được hiển thị rõ trước khi
          giao dịch hoàn tất.
        </p>
        <p className="mt-2">
          Giao dịch chỉ được xem là thành công khi hệ thống hiển thị xác nhận và vé điện tử được gửi
          đến email hoặc tài khoản của bạn. Nếu tài khoản bị trừ tiền nhưng chưa nhận được vé, vui lòng
          liên hệ hỗ trợ kèm mã giao dịch để được kiểm tra.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">4. Xác nhận vé và sử dụng vé</h2>
        <p className="mt-2">
          Vé điện tử hoặc mã QR là căn cứ để vào rạp. Vui lòng đến rạp trước giờ chiếu để làm thủ tục
          soát vé. Việc vào rạp muộn có thể bị hạn chế tùy theo quy định của từng cụm rạp.
        </p>
        <p className="mt-2">
          Mỗi vé chỉ có giá trị cho đúng suất chiếu, phòng chiếu và vị trí ghế đã xác nhận. Vé đã sử
          dụng không được tái sử dụng hoặc chuyển nhượng trái quy định.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">5. Hủy, đổi và hoàn vé</h2>
        <p className="mt-2">
          Giao dịch đã thanh toán thành công thông thường không được hủy, đổi hoặc hoàn tiền. Ngoại lệ
          áp dụng khi rạp thông báo hủy suất chiếu, thay đổi giờ chiếu, xảy ra lỗi kỹ thuật dẫn đến
          thanh toán trùng hoặc theo quy định của pháp luật.
        </p>
        <p className="mt-2">
          Thời gian hoàn tiền phụ thuộc vào ngân hàng hoặc ví điện tử, thường từ 3 đến 7 ngày làm việc.
          Vui lòng cung cấp mã giao dịch khi liên hệ bộ phận hỗ trợ để được xử lý nhanh nhất.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">6. Quy định về độ tuổi</h2>
        <p className="mt-2">
          Khách hàng phải tuân thủ phân loại độ tuổi xem phim theo quy định của Bộ Văn hóa, Thể thao và
          Du lịch:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>P: Phim được phép phổ biến đến mọi lứa tuổi.</li>
          <li>K: Phim được phổ biến đến người xem dưới 13 tuổi với điều kiện xem cùng cha mẹ hoặc người giám hộ.</li>
          <li>T13: Phim phổ biến đến người xem từ đủ 13 tuổi trở lên.</li>
          <li>T16: Phim phổ biến đến người xem từ đủ 16 tuổi trở lên.</li>
          <li>T18: Phim phổ biến đến người xem từ đủ 18 tuổi trở lên.</li>
        </ul>
        <p className="mt-2">
          Rạp chiếu có quyền yêu cầu xuất trình giấy tờ tùy thân để xác minh độ tuổi và từ chối phục vụ
          nếu khách hàng không đáp ứng quy định.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">7. Hành vi bị nghiêm cấm</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Sử dụng thông tin giả mạo, mạo danh người khác hoặc lập tài khoản với mục đích gian lận.</li>
          <li>Dùng công cụ tự động để thu thập dữ liệu, đặt vé hàng loạt hoặc gây quá tải hệ thống.</li>
          <li>Mua vé để bán lại nhằm thu lợi bất chính hoặc cản trở người dùng khác đặt vé.</li>
          <li>Can thiệp, phá hoại, thay đổi trái phép website, ứng dụng hoặc hệ thống thanh toán.</li>
          <li>Đăng tải nội dung vi phạm pháp luật, thuần phong mỹ tục hoặc quyền của bên thứ ba.</li>
        </ul>
        <p className="mt-2">
          Seenema có thể hủy vé, khóa tài khoản và áp dụng các biện pháp cần thiết đối với hành vi vi
          phạm mà không hoàn lại chi phí đã thanh toán.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">8. Quyền sở hữu trí tuệ</h2>
        <p className="mt-2">
          Logo, giao diện, nội dung, dữ liệu và mã nguồn của Seenema thuộc quyền sở hữu của Seenema hoặc
          các bên cấp phép. Bạn không được sao chép, sửa đổi, phân phối hoặc sử dụng cho mục đích
          thương mại khi chưa có sự đồng ý bằng văn bản.
        </p>
        <p className="mt-2">
          Tên phim, hình ảnh, trailer và các tài liệu quảng cáo liên quan thuộc quyền của chủ sở hữu
          tương ứng và được sử dụng nhằm mục đích giới thiệu dịch vụ.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">9. Bảo mật và dữ liệu cá nhân</h2>
        <p className="mt-2">
          Seenema thu thập các thông tin cần thiết như họ tên, email, số điện thoại và lịch sử giao
          dịch để xử lý việc đặt vé, cung cấp hỗ trợ và cải thiện chất lượng dịch vụ.
        </p>
        <p className="mt-2">
          Chúng tôi không bán dữ liệu cá nhân của khách hàng. Thông tin chỉ được chia sẻ với đối tác
          thanh toán, cụm rạp hoặc cơ quan có thẩm quyền khi cần thiết để thực hiện giao dịch, giải
          quyết khiếu nại hoặc theo yêu cầu của pháp luật.
        </p>
        <p className="mt-2">
          Bạn có thể truy cập, cập nhật hoặc yêu cầu điều chỉnh thông tin cá nhân trong mục tài khoản
          hoặc liên hệ bộ phận hỗ trợ của Seenema.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">10. Giới hạn trách nhiệm</h2>
        <p className="mt-2">
          Seenema nỗ lực duy trì dịch vụ ổn định nhưng không bảo đảm hệ thống luôn hoạt động liên tục,
          không có lỗi hoặc không bị gián đoạn bởi bảo trì, đường truyền, nhà cung cấp dịch vụ hoặc các
          sự kiện bất khả kháng.
        </p>
        <p className="mt-2">
          Trong phạm vi pháp luật cho phép, Seenema không chịu trách nhiệm đối với các thiệt hại gián
          tiếp phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ. Các quyền lợi bắt buộc của
          người tiêu dùng theo quy định pháp luật vẫn được bảo đảm.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">11. Thay đổi điều khoản</h2>
        <p className="mt-2">
          Seenema có thể cập nhật các điều khoản này để phù hợp với hoạt động kinh doanh hoặc quy định
          pháp luật. Phiên bản mới sẽ được đăng tải trên website kèm ngày cập nhật. Việc tiếp tục sử
          dụng dịch vụ sau khi điều khoản có hiệu lực được hiểu là bạn chấp thuận nội dung mới.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">12. Liên hệ</h2>
        <p className="mt-2">
          Nếu có câu hỏi hoặc cần hỗ trợ về các điều khoản này, vui lòng liên hệ Seenema qua email{' '}
          <a
            href="mailto:support@seenema.vn"
            className="font-semibold text-[var(--color-brand-primary)] hover:underline"
          >
            support@seenema.vn
          </a>{' '}
          hoặc hotline <span className="font-semibold text-[var(--color-text-primary)]">1900 6868</span>.
        </p>
      </section>
    </div>
  );
}
