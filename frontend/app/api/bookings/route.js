import { NextResponse } from "next/server";

const BOOKING_SERVICE_URL =
  process.env.BOOKING_SERVICE_URL || "http://localhost:8080";

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

// ---------------------------------------------------------------------------
// GET /api/bookings — danh sách vé của người dùng đang đăng nhập.
// Booking Service chưa có endpoint theo người dùng nên lấy toàn bộ rồi lọc,
// sau đó ghép thêm thông tin suất chiếu, phim, ghế và trạng thái thanh toán.
// ---------------------------------------------------------------------------
const MOVIE_SERVICE_URL =
  process.env.MOVIE_SERVICE_URL || "http://localhost:8080";
const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:8080";
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:8081";
const INTERNAL_API_KEY = process.env.USER_SERVICE_INTERNAL_API_KEY || "";

const ENRICH_LIMIT = 30;

async function getJson(url, { token, internal } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (internal) headers["X-Internal-Api-Key"] = INTERNAL_API_KEY;

  const response = await fetch(url, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) return null;

  return response.json().catch(() => null);
}

function seatLabel(seat) {
  return `${seat?.row ?? ""}${seat?.number ?? ""}`;
}

export async function GET(request) {
  const accessToken = request.cookies.get("mtbs_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập để xem vé." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const authUserId = Number(request.cookies.get("mtbs_user_id")?.value);
  if (!Number.isSafeInteger(authUserId) || authUserId <= 0) {
    return NextResponse.json(
      { message: "Không xác định được tài khoản." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    // Booking cũ lưu userId theo id hồ sơ, booking mới lưu theo auth user id.
    // Lấy hồ sơ để chấp nhận cả hai cách đánh số.
    const profile = await getJson(
      `${USER_SERVICE_URL}/api/users/internal/profiles/by-auth-user/${authUserId}`,
      { internal: true },
    ).catch(() => null);

    const allowedUserIds = new Set([authUserId]);
    if (profile?.id != null) allowedUserIds.add(Number(profile.id));

    // Booking Service lưu userId theo id hồ sơ, nên ưu tiên truy vấn theo id đó
    const primaryUserId = profile?.id != null ? Number(profile.id) : authUserId;

    let bookings = await getJson(
      `${BOOKING_SERVICE_URL}/api/bookings/user/${primaryUserId}`,
      { token: accessToken },
    );

    // Dự phòng khi endpoint theo người dùng không dùng được
    if (!Array.isArray(bookings)) {
      const all = await getJson(`${BOOKING_SERVICE_URL}/api/bookings`, {
        token: accessToken,
      });
      bookings = Array.isArray(all)
        ? all.filter((booking) => allowedUserIds.has(Number(booking.userId)))
        : null;
    }

    if (!Array.isArray(bookings)) {
      return NextResponse.json(
        { message: "Không tải được danh sách vé." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const mine = bookings
      .filter((booking) => allowedUserIds.has(Number(booking.userId)))
      .sort((a, b) => Number(b.bookingId) - Number(a.bookingId))
      .slice(0, ENRICH_LIMIT);
    if (mine.length === 0) {
      return NextResponse.json([], {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    // Gọi song song từng tầng để giảm số vòng round-trip (Supabase ở xa).
    // Tầng 1: suất chiếu, ghế của suất chiếu, thanh toán của từng vé.
    const showtimeIds = [...new Set(mine.map((booking) => Number(booking.showtimeId)))];

    const [showtimeEntries, seatEntries, payments] = await Promise.all([
      Promise.all(
        showtimeIds.map(async (showtimeId) => [
          showtimeId,
          await getJson(`${MOVIE_SERVICE_URL}/api/getShowtimeById?id=${showtimeId}`),
        ]),
      ),
      Promise.all(
        showtimeIds.map(async (showtimeId) => [
          showtimeId,
          await getJson(
            `${MOVIE_SERVICE_URL}/api/getSeatsByShowtime?showtimeId=${showtimeId}`,
          ),
        ]),
      ),
      Promise.all(
        mine.map(async (booking) => [
          Number(booking.bookingId),
          await getJson(
            `${PAYMENT_SERVICE_URL}/api/v1/payments/booking/${booking.bookingId}`,
            { token: accessToken },
          ),
        ]),
      ),
    ]);

    const showtimeById = new Map(showtimeEntries.filter(([, item]) => item));

    const movieIds = new Set();
    for (const showtime of showtimeById.values()) {
      if (showtime?.movieId != null) movieIds.add(Number(showtime.movieId));
    }

    // Tầng 2: thông tin phim
    const movieEntries = await Promise.all(
      [...movieIds].map(async (movieId) => [
        movieId,
        await getJson(`${MOVIE_SERVICE_URL}/api/getMovieById?id=${movieId}`),
      ]),
    );

    const movieById = new Map(movieEntries.filter(([, movie]) => movie));
    const seatsByShowtime = new Map(
      seatEntries.map(([showtimeId, seats]) => [
        showtimeId,
        new Map(
          (Array.isArray(seats) ? seats : []).map((seat) => [Number(seat.id), seat]),
        ),
      ]),
    );
    const paymentByBooking = new Map(payments);

    const items = mine.map((booking) => {
      const showtime = showtimeById.get(Number(booking.showtimeId)) ?? null;
      const movie = showtime?.movieId != null
        ? movieById.get(Number(showtime.movieId)) ?? null
        : null;
      const seatMap = seatsByShowtime.get(Number(booking.showtimeId)) ?? new Map();
      const payment = paymentByBooking.get(Number(booking.bookingId)) ?? null;

      // Hạn giữ ghế do booking-service lưu lúc giữ ghế (paymentExpiresAt).
      // KHÔNG suy ra từ holdUntil của ghế: ghế có thể đang bị người khác giữ,
      // khi đó hạn giữ của họ không phải của vé này.
      const holdUntil = booking.holdUntil ?? null;

      return {
        bookingId: booking.bookingId,
        amount: booking.amount,
        status: booking.status,
        holdUntil,
        createdAt: booking.createdAt ?? null,
        seatIds: booking.seatIds ?? [],
        seats: (booking.seatIds ?? [])
          .map((seatId) => seatMap.get(Number(seatId)))
          .filter(Boolean)
          .map(seatLabel),
        showtimeId: booking.showtimeId,
        startTime: showtime?.startTime ?? null,
        endTime: showtime?.endTime ?? null,
        roomName: showtime?.roomName ?? null,
        cinemaName: showtime?.cinemaName ?? null,
        cinemaCity: showtime?.cinemaCity ?? null,
        movieId: showtime?.movieId ?? null,
        movieTitle: movie?.title ?? null,
        posterUrl: movie?.posterUrl ?? null,
        paymentStatus: payment?.paymentStatus ?? null,
      };
    });

    return NextResponse.json(items, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error.name === "TimeoutError"
            ? "Máy chủ phản hồi quá thời gian."
            : "Không thể tải danh sách vé.",
      },
      { status: error.name === "TimeoutError" ? 504 : 503 },
    );
  }
}
