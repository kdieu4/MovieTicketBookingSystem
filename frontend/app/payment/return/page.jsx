"use client";

import { useEffect, useState } from "react";
import { getPaymentById } from "@/services/paymentApi";

const TICKETS_PATH = "/ve-cua-toi";

export default function VNPayReturnPage() {
  const [message, setMessage] = useState("Đang xác nhận thanh toán...");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function stop(text) {
      if (cancelled) return;
      setMessage(text);
      setFailed(true);
    }

    async function verifyPayment() {
      const params = new URLSearchParams(window.location.search);
      const txnRef = params.get("txnRef");
      const status = params.get("status");

      // Backend đã xác nhận nhưng chữ ký VNPay không hợp lệ
      if (["INVALID_SIGNATURE", "ORDER_NOT_FOUND", "INVALID_AMOUNT"].includes(status)) {
        stop("Không xác thực được giao dịch VNPay.");
        return;
      }

      if (!/^P\d+$/.test(txnRef || "")) {
        stop("Mã giao dịch không hợp lệ.");
        return;
      }

      const paymentId = Number(txnRef.slice(1));

      // Return URL đã cập nhật Payment, polling chỉ để chờ gateway/DB đồng bộ
      for (let i = 0; i < 10 && !cancelled; i++) {
        try {
          const payment = await getPaymentById(paymentId);

          if (cancelled) return;

          if (payment.paymentStatus === "SUCCESS") {
            window.location.replace(TICKETS_PATH);
            return;
          }

          if (payment.paymentStatus === "FAILED") {
            stop("Thanh toán không thành công.");
            return;
          }
        } catch (error) {
          console.error("Payment verification error:", error);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      stop("Chưa nhận được xác nhận thanh toán từ Backend.");
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="p-10 text-center">
      <p>{message}</p>
      {failed && (
        <a href={TICKETS_PATH} className="mt-4 inline-block underline">
          Về vé của tôi
        </a>
      )}
    </main>
  );
}
