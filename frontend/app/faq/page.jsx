"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const FAQS = [
  {
    category: 'Đặt vé & Thanh toán',
    questions: [
      {
        q: 'Tôi có thể hủy vé hoặc thay đổi suất chiếu sau khi đã thanh toán thành công không?',
        a: 'Theo quy định của rạp, vé đã thanh toán thành công không hỗ trợ hoàn tiền hoặc hủy vé. Tuy nhiên, bạn có thể liên hệ tổng đài hỗ trợ trước giờ chiếu 2 tiếng để được xem xét đổi suất chiếu cùng phim.',
      },
      {
        q: 'Các phương thức thanh toán nào được chấp nhận?',
        a: 'Seenema chấp nhận thanh toán qua thẻ ATM nội địa, thẻ quốc tế (Visa, MasterCard, JCB), quét mã VNPAY-QR, Momo, ZaloPay và ShopeePay.',
      },
      {
        q: 'Tôi không nhận được email xác nhận vé sau khi đã trừ tiền?',
        a: 'Bạn vui lòng kiểm tra hòm thư Rác/Spam. Nếu vẫn không thấy, hãy truy cập mục "Lịch sử đặt vé" trong Tài khoản hoặc gọi hotline hỗ trợ để kiểm tra trạng thái đơn hàng.',
      },
      {
        q: 'Tôi có bao nhiêu thời gian để hoàn tất thanh toán sau khi chọn ghế?',
        a: 'Ghế bạn chọn sẽ được giữ trong 10 phút kể từ lúc bắt đầu thanh toán. Quá thời gian này, hệ thống sẽ tự động nhả ghế và bạn cần chọn lại từ đầu.',
      },
      {
        q: 'Tiền đã bị trừ nhưng giao dịch báo thất bại, tôi phải làm sao?',
        a: 'Trường hợp này thường do đường truyền gián đoạn. Số tiền bị trừ sẽ được ngân hàng hoặc ví điện tử hoàn lại trong vòng 3 đến 7 ngày làm việc. Nếu quá thời gian trên, hãy liên hệ hotline kèm mã giao dịch để được hỗ trợ.',
      },
      {
        q: 'Một lần đặt được tối đa bao nhiêu vé?',
        a: 'Mỗi giao dịch cho phép đặt tối đa 8 ghế trong cùng một suất chiếu. Nếu cần đặt số lượng lớn cho nhóm hoặc doanh nghiệp, vui lòng liên hệ bộ phận chăm sóc khách hàng.',
      },
    ],
  },
  {
    category: 'Vé & Nhận vé tại rạp',
    questions: [
      {
        q: 'Tôi cần mang gì khi đến rạp để vào xem phim?',
        a: 'Bạn chỉ cần xuất trình mã QR trong email xác nhận hoặc trong mục "Lịch sử đặt vé" tại quầy soát vé. Bạn không cần in vé giấy.',
      },
      {
        q: 'Tôi đến trễ giờ chiếu thì có được vào phòng không?',
        a: 'Bạn vẫn có thể vào phòng chiếu trong thời gian chiếu quảng cáo và giới thiệu phim. Để có trải nghiệm tốt nhất, bạn nên có mặt trước giờ chiếu khoảng 15 phút.',
      },
      {
        q: 'Trẻ em có cần mua vé không?',
        a: 'Mọi khán giả vào phòng chiếu đều cần có vé, trừ trường hợp rạp có thông báo riêng. Phim cũng được phân loại độ tuổi (P, K, T13, T16, T18) và bạn cần tuân thủ quy định tương ứng.',
      },
      {
        q: 'Tôi có thể mang đồ ăn, thức uống từ bên ngoài vào rạp không?',
        a: 'Để giữ vệ sinh chung, rạp không cho phép mang đồ ăn, thức uống từ bên ngoài vào phòng chiếu. Bạn có thể mua bắp nước và combo ngay tại quầy hoặc đặt kèm khi mua vé online.',
      },
    ],
  },
  {
    category: 'Thành viên & Ưu đãi',
    questions: [
      {
        q: 'Làm thế nào để tích điểm thành viên khi đặt vé online?',
        a: 'Khi bạn đã đăng nhập tài khoản Seenema trước khi thực hiện giao dịch, điểm thưởng sẽ tự động tích lũy vào tài khoản ngay sau khi thanh toán hoàn tất.',
      },
      {
        q: 'Nhiều mã giảm giá có thể áp dụng chung trong một giao dịch không?',
        a: 'Mỗi giao dịch đặt vé chỉ áp dụng tối đa 01 mã ưu đãi hoặc voucher thanh toán.',
      },
      {
        q: 'Điểm thưởng có thời hạn sử dụng không?',
        a: 'Điểm thưởng có hiệu lực trong 12 tháng kể từ ngày phát sinh. Bạn có thể theo dõi số điểm và ngày hết hạn trong mục Tài khoản.',
      },
      {
        q: 'Tôi nhập mã giảm giá nhưng hệ thống báo không hợp lệ?',
        a: 'Hãy kiểm tra lại hạn sử dụng, điều kiện áp dụng (suất chiếu, loại ghế, giá trị đơn hàng tối thiểu) và thử nhập lại. Mã ưu đãi cũng chỉ dùng được một lần trên mỗi tài khoản nếu chương trình không quy định khác.',
      },
    ],
  },
  {
    category: 'Tài khoản & Bảo mật',
    questions: [
      {
        q: 'Tôi quên mật khẩu thì lấy lại như thế nào?',
        a: 'Tại trang đăng nhập, chọn "Quên mật khẩu" và nhập email đã đăng ký. Hệ thống sẽ gửi liên kết đặt lại mật khẩu đến hộp thư của bạn.',
      },
      {
        q: 'Làm sao để thay đổi thông tin cá nhân hoặc email đăng ký?',
        a: 'Bạn vào mục Tài khoản, chọn "Thông tin cá nhân" để cập nhật họ tên, số điện thoại và các thông tin khác. Riêng email đăng nhập cần được xác minh lại sau khi thay đổi.',
      },
      {
        q: 'Thông tin thẻ thanh toán của tôi có được lưu lại không?',
        a: 'Seenema không lưu trữ thông tin thẻ của bạn. Mọi giao dịch được xử lý qua cổng thanh toán đối tác với kết nối mã hóa.',
      },
    ],
  },
];

function PlusIcon({ open }) {
  return (
    <span
      aria-hidden="true"
      className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-out motion-reduce:transition-none ${
        open
          ? 'rotate-45 border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white'
          : 'rotate-0 border-[var(--color-border-separator)] text-[var(--color-text-tertiary)] group-hover:border-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-primary)]'
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 1.5v9M1.5 6h9" />
      </svg>
    </span>
  );
}

export default function FAQPage() {
  const [openId, setOpenId] = useState(null);

  function toggleQuestion(id) {
    setOpenId(openId === id ? null : id);
  }

  return (
    <div
      className="faq-light flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
      style={{
        '--color-bg-primary': '#f5f6fa',
        '--color-bg-tertiary': '#ffffff',
        '--color-text-primary': '#1b1d2a',
        '--color-text-secondary': '#555a6e',
        '--color-text-tertiary': '#8a8fa3',
        '--color-border-separator': '#e3e6ef',
        '--shadow-low': '0 1px 2px rgba(27, 29, 42, 0.06), 0 4px 12px rgba(27, 29, 42, 0.04)',
        '--radius-lg': '16px',
      }}
    >
      <Header />
      <main className="animate-fade-in mx-auto w-full flex-1 max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Câu hỏi thường gặp</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Giải đáp nhanh các thắc mắc về đặt vé, thanh toán, nhận vé tại rạp và tài khoản thành viên.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {FAQS.map((group) => (
            <section key={group.category}>
              <h2 className="text-lg font-bold tracking-tight text-[var(--color-brand-primary)]">
                {group.category}
              </h2>
              <div className="mt-4 divide-y divide-[var(--color-border-separator)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] shadow-[var(--shadow-low)]">
                {group.questions.map((item, idx) => {
                  const id = `${group.category}-${idx}`;
                  const isOpen = openId === id;
                  const panelId = `faq-panel-${group.category}-${idx}`.replace(/\s+/g, '-');

                  return (
                    <div
                      key={id}
                      className={`transition-colors duration-300 motion-reduce:transition-none ${
                        isOpen
                          ? 'bg-[color-mix(in_srgb,var(--color-brand-primary)_8%,white)]'
                          : 'bg-transparent hover:bg-[#f9fafc]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(id)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="group flex w-full items-center justify-between p-4 text-left text-sm font-medium text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-brand-primary)] sm:p-5"
                      >
                        <span className={`transition-colors duration-300 ${isOpen ? 'text-[var(--color-brand-primary)]' : ''}`}>
                          {item.q}
                        </span>
                        <PlusIcon open={isOpen} />
                      </button>

                      <div
                        id={panelId}
                        role="region"
                        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p
                            className={`px-4 pb-5 text-sm leading-relaxed text-[var(--color-text-secondary)] transition-all duration-300 ease-out motion-reduce:transition-none sm:px-5 ${
                              isOpen ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
                            }`}
                          >
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}