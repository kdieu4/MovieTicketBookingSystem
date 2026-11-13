import { NextResponse } from "next/server";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:8085";

export async function POST(request) {
  const origin = request.headers.get("origin");

  if (origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { status: 403, message: "Nguồn yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }

  let credentials;

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { status: 400, message: "Dữ liệu đăng nhập không hợp lệ." },
      { status: 400 },
    );
  }

  if (
    typeof credentials?.email !== "string" ||
    typeof credentials?.password !== "string" ||
    !credentials.email.trim() ||
    !credentials.password
  ) {
    return NextResponse.json(
      { status: 400, message: "Vui lòng nhập email và mật khẩu." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json().catch(() => ({}));
    const backendStatus = result.status ?? response.status;

    if (!response.ok || backendStatus !== 200) {
      const status =
        backendStatus >= 400 && backendStatus <= 599 ? backendStatus : 502;

      return NextResponse.json(
        {
          status,
          message: result.message || "Đăng nhập thất bại.",
        },
        { status },
      );
    }

    const { accessToken, refreshToken, userId } = result.data ?? {};

    if (!accessToken || !refreshToken || userId == null) {
      return NextResponse.json(
        { status: 502, message: "Auth Service trả thiếu dữ liệu." },
        { status: 502 },
      );
    }

    const res = NextResponse.json(
      {
        status: 200,
        message: "Đăng nhập thành công.",
        data: { userId },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    res.cookies.set("mtbs_access_token", accessToken, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60,
    });

    res.cookies.set("mtbs_refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 14 * 24 * 60 * 60,
    });

    return res;
  } catch {
    return NextResponse.json(
      {
        status: 503,
        message: "Không thể kết nối Auth Service.",
      },
      { status: 503 },
    );
  }
}
