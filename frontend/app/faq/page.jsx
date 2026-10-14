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
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  function toggleQuestion(id) {
    setOpenId(openId === id ? null : id);
  }

  const keyword = searchQuery.trim().toLowerCase();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Câu hỏi thường gặp</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Giải đáp nhanh chóng các thắc mắc của bạn về dịch vụ đặt vé trực tuyến.
          </p>

          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm câu hỏi..."
                className="w-full rounded-full border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] px-5 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-brand-primary)] focus:outline-none shadow-[var(--shadow-low)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-10">
          {FAQS.map((group) => {
            const visibleItems = group.questions
              .map((item, idx) => ({ item, id: `${group.category}-${idx}` }))
              .filter(({ item }) => item.q.toLowerCase().includes(keyword));

            return (
              <div key={group.category}>
                <h2 className="text-lg font-bold tracking-tight text-[var(--color-brand-primary)]">
                  {group.category}
                </h2>
                <div className="mt-4 divide-y divide-[var(--color-border-separator)] rounded-[var(--radius-lg)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)]">
                  {visibleItems.map(({ item, id }) => {
                    const isOpen = openId === id;
                    return (
                      <div key={id} className="p-4 sm:p-5">
                        <button
                          type="button"
                          onClick={() => toggleQuestion(id)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between text-left font-medium text-sm text-[var(--color-text-primary)] focus:outline-none"
                        >
                          <span>{item.q}</span>
                          <span className="ml-4 text-[var(--color-text-tertiary)]">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        {isOpen && (
                          <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                            {item.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}