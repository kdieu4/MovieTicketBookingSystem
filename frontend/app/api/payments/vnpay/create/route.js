import { NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:8080";

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

  const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || "http://localhost:8080";

  try {
    // Chặn thanh toán cho vé đã quá hạn giữ chỗ: hạn này tính từ lúc tạo booking
    // (10 phút), không được gia hạn khi người dùng quay lại sau.
    const bookingResponse = await fetch(
      `${bookingServiceUrl}/api/bookings/${bookingId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );

    const booking = await bookingResponse.json().catch(() => null);

    if (bookingResponse.ok && booking) {
      if (booking.status && booking.status !== "PENDING") {
        return NextResponse.json(
          { message: "Vé này không còn ở trạng thái chờ thanh toán." },
          { status: 409 },
        );
      }

      const holdUntil = booking.holdUntil ? new Date(booking.holdUntil).getTime() : null;

      if (holdUntil && holdUntil <= Date.now()) {
        return NextResponse.json(
          {
            message:
              "Đã hết thời gian giữ chỗ. Vui lòng đặt lại vé để giữ ghế mới.",
          },
          { status: 409 },
        );
      }
    }
  } catch {
    // Không kiểm tra được hạn giữ chỗ thì để Payment Service quyết định
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
