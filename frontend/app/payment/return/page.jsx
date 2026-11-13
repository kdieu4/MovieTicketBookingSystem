"use client";

import { useEffect, useState } from "react";
import { getPaymentById } from "@/services/paymentApi";

export default function VNPayReturnPage() {
  const [message, setMessage] = useState("Đang xác nhận thanh toán...");

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      const params = new URLSearchParams(window.location.search);
      const txnRef = params.get("txnRef");

      // 1. Kiểm tra mã giao dịch
      if (!/^P\d+$/.test(txnRef || "")) {
        setMessage("Mã giao dịch không hợp lệ.");
        return;
      }

      const paymentId = Number(txnRef.slice(1));

      // 2. Lấy thông tin Booking đã lưu
      let ticket;

      try {
        const saved = localStorage.getItem("mtbs-checkout");
        ticket = saved ? JSON.parse(saved) : null;
      } catch {
        setMessage("Dữ liệu đặt vé không hợp lệ.");
        return;
      }

      if (!ticket || Number(ticket.paymentId) !== paymentId) {
        setMessage("Vui lòng kiểm tra kết quả trên thiết bị đã đặt vé.");
        return;
      }

      // 3. Polling trạng thái Payment
      for (let i = 0; i < 20 && !cancelled; i++) {
        try {
          const payment = await getPaymentById(paymentId);

          if (cancelled) return;

          console.log("Payment:", payment);

          // 4. Thanh toán thành công
          if (
            payment.paymentStatus === "SUCCESS" &&
            Number(payment.bookingId) === Number(ticket.bookingId)
          ) {
            localStorage.setItem("mtbs-paid-booking", JSON.stringify(ticket));

            if (
              typeof ticket.returnPath === "string" &&
              ticket.returnPath.startsWith("/") &&
              !ticket.returnPath.startsWith("//")
            ) {
              window.location.replace(ticket.returnPath);
            } else {
              setMessage("Thanh toán thành công. Đang chờ xác nhận vé.");
            }

            return;
          }

          // 5. Thanh toán thất bại
          if (payment.paymentStatus === "FAILED") {
            setMessage("Thanh toán không thành công.");
            return;
          }

          // 6. Payment vẫn PENDING → tiếp tục polling
        } catch (error) {
          console.error("Payment verification error:", error);
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) {
        setMessage("Chưa nhận được xác nhận thanh toán từ Backend.");
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  return <main className="p-10 text-center">{message}</main>;
}
