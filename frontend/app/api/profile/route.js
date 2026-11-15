import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:8081";
const INTERNAL_API_KEY = process.env.USER_SERVICE_INTERNAL_API_KEY || "";

const NO_STORE = { "Cache-Control": "no-store" };

// authUserId được BFF ghi vào cookie lúc đăng nhập (xem /api/auth/login)
async function currentAuthUserId() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("mtbs_user_id")?.value;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function fetchProfile(authUserId) {
  const response = await fetch(
    `${USER_SERVICE_URL}/api/users/internal/profiles/by-auth-user/${authUserId}`,
    {
      headers: { "X-Internal-Api-Key": INTERNAL_API_KEY },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  );

  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

export async function GET() {
  const authUserId = await currentAuthUserId();

  if (!authUserId) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập." },
      { status: 401, headers: NO_STORE },
    );
  }

  try {
    const { ok, status, body } = await fetchProfile(authUserId);

    if (status === 404) {
      return NextResponse.json(
        { message: "Không tìm thấy hồ sơ người dùng." },
        { status: 404, headers: NO_STORE },
      );
    }

    if (!ok) {
      return NextResponse.json(
        { message: body.message || "Không tải được hồ sơ." },
        { status: 502, headers: NO_STORE },
      );
    }

    return NextResponse.json(body, { status: 200, headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { message: "Không thể kết nối User Service." },
      { status: 503, headers: NO_STORE },
    );
  }
}

export async function PUT(request) {
  const authUserId = await currentAuthUserId();

  if (!authUserId) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập." },
      { status: 401, headers: NO_STORE },
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ." },
      { status: 400, headers: NO_STORE },
    );
  }

  const fullName = typeof payload?.fullName === "string" ? payload.fullName.trim() : "";
  const phoneNumber =
    typeof payload?.phoneNumber === "string" ? payload.phoneNumber.trim() : "";

  if (!fullName || !phoneNumber) {
    return NextResponse.json(
      { message: "Vui lòng nhập họ tên và số điện thoại." },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    // Email không cho sửa nên lấy lại từ hồ sơ hiện tại
    const current = await fetchProfile(authUserId);

    if (!current.ok || !current.body?.id) {
      return NextResponse.json(
        { message: "Không tìm thấy hồ sơ người dùng." },
        { status: 404, headers: NO_STORE },
      );
    }

    const response = await fetch(
      `${USER_SERVICE_URL}/api/users/${current.body.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: current.body.email,
          phoneNumber,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: body.message || "Không lưu được thay đổi." },
        { status: response.status, headers: NO_STORE },
      );
    }

    return NextResponse.json(body, { status: 200, headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { message: "Không thể kết nối User Service." },
      { status: 503, headers: NO_STORE },
    );
  }
}
