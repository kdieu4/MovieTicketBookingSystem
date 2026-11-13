import { NextResponse } from "next/server";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:8085";

export async function POST(request) {
  const origin = request.headers.get("origin");

  if (origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { status: 403, message: "Nguồn yêu cầu không hợp lệ." },
      { status: 403 }
    );
  }

  const accessToken = request.cookies.get("mtbs_access_token")?.value;

  let status = 200;
  let message = "Đăng xuất thành công.";

  if (accessToken) {
    try {
      const backendResponse = await fetch(
        `${AUTH_SERVICE_URL}/auth/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }
      );

      const result = await backendResponse.json().catch(() => ({}));

      if (!backendResponse.ok || result.status >= 400) {
        status = 502;
        message = "Đã xóa Cookie nhưng chưa thể xác nhận thu hồi phiên.";
      }
    } catch {
      status = 503;
      message = "Đã xóa Cookie nhưng không thể kết nối Auth Service.";
    }
  }

  const response = NextResponse.json(
    { status, message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("mtbs_access_token", "", cookieOptions);

  response.cookies.set("mtbs_refresh_token", "", cookieOptions);

  return response;
}