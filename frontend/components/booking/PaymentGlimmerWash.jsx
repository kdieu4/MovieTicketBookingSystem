'use client';

import { useEffect, useState } from 'react';

// Glimmer toả từ trên xuống khi banner thanh toán hiện ra: một dải sáng phủ ngang
// màn hình, trượt từ mép trên xuống hết khung rồi tan. Chạy đúng một lần.
// Chỉ là lớp trang trí: pointer-events-none, aria-hidden, tự gỡ sau khi chạy xong.
const GLIMMER_MS = 1200;

export default function PaymentGlimmerWash() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDone(true), GLIMMER_MS + 200);
    return () => window.clearTimeout(timer);
  }, []);

  if (done) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[85] overflow-hidden">
      <span
        className="pay-glimmer absolute inset-x-0 top-0 h-[45vh] blur-md"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,127,255,0) 0%, rgba(0,127,255,0.16) 42%, rgba(255,255,255,0.5) 70%, rgba(0,127,255,0.28) 86%, rgba(0,127,255,0) 100%)',
        }}
      />
    </div>
  );
}
