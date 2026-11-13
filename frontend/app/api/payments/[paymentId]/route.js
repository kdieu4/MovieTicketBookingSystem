import { NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:8084";

export async function GET(request, { params }) {
  const { paymentId } = await params;

  if (
    !/^[1-9]\d*$/.test(paymentId) ||
    !Number.isSafeInteger(Number(paymentId))
  ) {
    return NextResponse.json(
      { message: "Payment ID không hợp lệ." },
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
      `${PAYMENT_SERVICE_URL}/api/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    const data = await response.json().catch(() => null);
    if (data === null) {
      return NextResponse.json(
        { message: "Payment Service trả về dữ liệu không hợp lệ." },
        { status: 502 },
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
            ? "Payment Service phản hồi quá thời gian."
            : "Không thể kết nối Payment Service.",
      },
      { status: error.name === "TimeoutError" ? 504 : 503 },
    );
  }
}
