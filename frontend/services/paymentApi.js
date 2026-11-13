const PAYMENT_BASE_URL = "http://localhost:8084/api/v1";

// export async function createVNPayPayment(bookingId) {
//   const response = await fetch(`${PAYMENT_BASE_URL}/vnpay`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ bookingId }),
//   });

//   if (!response.ok) {
//     throw new Error(`Payment API Error: ${response.status}`);
//   }

//   return response.json();
// }

export async function createVNPayPayment(bookingId) {
  const response = await fetch("/api/payments/vnpay/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ bookingId }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      data?.message || `Payment API Error: ${response.status}`,
    );
    error.status = response.status;
    throw error;
  }

  if (!data?.payUrl) {
    throw new Error("Payment Service không trả về payUrl.");
  }
  return data;
}

export async function getPaymentById(paymentId) {
  const response = await fetch(`/api/payments/${paymentId}`, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || "Không thể kiểm tra trạng thái thanh toán.",
    );
  }

  // Giữ nguyên cấu trúc response hiện tại của Payment Service.
  const payment = result?.data?.data;

  if (!payment) {
    throw new Error("Dữ liệu Payment không hợp lệ.");
  }

  return payment;
}

// export async function getPaymentById(paymentId) {
//   const response = await fetch(
//     `http://localhost:8084/api/v1/payments/${paymentId}`,
//     { cache: "no-store" },
//   );

//   if (!response.ok) {
//     throw new Error("Không thể kiểm tra trạng thái thanh toán");
//   }

//   const result = await response.json();

//   return result.data.data;
// }

export async function waitForPayment(bookingId) {
  const deadline = Date.now() + 10000; // Tổng timeout: 10 giây

  for (let attempt = 0; attempt < 6; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    const response = await fetch(`/api/payments/booking/${bookingId}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      signal: AbortSignal.timeout(Math.min(2000, remaining)),
    });

    if (response.ok) {
      return await response.json();
    }

    if (response.status !== 404) {
      throw new Error(`Payment API error: ${response.status}`);
    }

    // Exponential Backoff: 200, 400, 800, 1600, 3200ms
    const delay = Math.min(200 * 2 ** attempt, deadline - Date.now());

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Timeout: Payment chưa được tạo");
}
