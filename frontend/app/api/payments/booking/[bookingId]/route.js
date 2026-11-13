import { NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:8084";

export async function GET(request, { params }) {
  const { bookingId } = await params;

  if (
    !/^[1-9]\d*$/.test(bookingId) ||
    !Number.isSafeInteger(Number(bookingId))
  ) {
    return NextResponse.json(
      { message: "Booking ID không hợp lệ." },
      { status: 400 },
    );
  }

  const accessToken = request.cookies.get("mtbs_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập." },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(
      `${PAYMENT_SERVICE_URL}/api/v1/payments/booking/${bookingId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        data ?? { message: "Không thể tra cứu Payment." },
        {
          status: response.status,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    if (data === null) {
      return NextResponse.json(
        { message: "Payment Service trả về dữ liệu không hợp lệ." },
        { status: 502 },
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
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
