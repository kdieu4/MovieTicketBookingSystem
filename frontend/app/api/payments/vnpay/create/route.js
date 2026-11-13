import { NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:8084";

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "Nguồn yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }

  const accessToken = request.cookies.get("mtbs_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập trước khi thanh toán." },
      { status: 401 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu thanh toán không hợp lệ." },
      { status: 400 },
    );
  }

  const bookingId = Number(body?.bookingId);
  if (!Number.isSafeInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json(
      { message: "Booking ID không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${PAYMENT_SERVICE_URL}/api/v1/vnpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ bookingId }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        {
          message: data?.message || "Không thể tạo thanh toán VNPay.",
        },
        { status: response.status },
      );
    }

    if (!data?.payUrl) {
      return NextResponse.json(
        { message: "Payment Service không trả về payUrl." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { payUrl: data.payUrl },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error.name === "TimeoutError"
            ? "Payment Service phản hồi quá thời gian."
            : "Không thể kết nối Payment Service.",
      },
      { status: error.name === "TimeoutError" ? 504 : 503 },
    );
  }
}
