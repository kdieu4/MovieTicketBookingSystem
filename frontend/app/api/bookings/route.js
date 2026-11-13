import { NextResponse } from "next/server";

const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL || "http://localhost:8082";

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
      { message: "Vui lòng đăng nhập trước khi đặt vé." },
      { status: 401 },
    );
  }

  let bookingData;
  try {
    bookingData = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu đặt vé không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${BOOKING_SERVICE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(bookingData),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json().catch(() => null);
    if (data === null) {
      return NextResponse.json(
        { message: "Booking Service trả về dữ liệu không hợp lệ." },
        { status: response.ok ? 502 : response.status },
      );
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error.name === "TimeoutError"
            ? "Booking Service phản hồi quá thời gian."
            : "Không thể kết nối Booking Service.",
      },
      { status: error.name === "TimeoutError" ? 504 : 503 },
    );
  }
}
