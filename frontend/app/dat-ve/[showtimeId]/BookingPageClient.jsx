"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import SeatPicker from "@/components/booking/SeatPicker";

import { loadSeats, lockSeats, invalidateSeats } from "@/services/seatApi";

import { createBooking } from "@/services/bookingApi";

export default function BookingPageClient({ showtimeId }) {
  const router = useRouter();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [loadingSeats, setLoadingSeats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submittingRef = useRef(false);

  // BƯỚC 1: Lấy sơ đồ ghế
  useEffect(() => {
    let active = true;

    async function fetchSeats() {
      try {
        setLoadingSeats(true);

        const data = await loadSeats(showtimeId);

        if (active) {
          setSeats(data);
        }
      } catch (err) {
        if (active) {
          setError("Không thể tải danh sách ghế");
        }
      } finally {
        if (active) {
          setLoadingSeats(false);
        }
      }
    }

    fetchSeats();

    return () => {
      active = false;
    };
  }, [showtimeId]);

  // BƯỚC 2: Nhóm ghế theo hàng
  const seatsByRow = useMemo(() => {
    const groups = new Map();

    seats.forEach((seat) => {
      const row = seat.row;

      if (!groups.has(row)) {
        groups.set(row, []);
      }

      groups.get(row).push(seat);
    });

    return Array.from(groups.entries());
  }, [seats]);

  // BƯỚC 3: Chọn / bỏ chọn ghế
  function handleToggleSeat(seat) {
    if (submittingRef.current) return;

    const unavailable =
      seat.isSold ||
      seat.isLocked ||
      ["LOCKED", "BOOKED"].includes(String(seat.status ?? "").toUpperCase());

    if (unavailable) return;

    setSelectedSeats((previous) => {
      const exists = previous.some(
        (item) => String(item.id) === String(seat.id),
      );

      if (exists) {
        return previous.filter((item) => String(item.id) !== String(seat.id));
      }

      if (previous.length >= 8) {
        return previous;
      }

      return [...previous, seat];
    });
  }

  // BƯỚC 4: Giữ ghế và tạo booking
  async function handleBooking() {
    if (submittingRef.current) return;

    if (selectedSeats.length === 0) {
      setError("Vui lòng chọn ít nhất một ghế");
      return;
    }

    // Thay bằng cơ chế lấy token từ Auth Service hiện tại
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setError("Vui lòng đăng nhập trước khi đặt vé");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const seatIds = selectedSeats.map((seat) => seat.id);

      // 1. Khóa ghế
      const lock = await lockSeats(showtimeId, seatIds, token);

      // 2. Tạo booking
      const booking = await createBooking(
        {
          showtimeId: Number(showtimeId),
          seatIds,
          lockId: lock.lockId,
        },
        token,
      );

      if (!booking?.id) {
        throw new Error("Backend không trả về bookingId");
      }

      // 3. Chuyển tới trang thanh toán
      router.push(`/thanh-toan/${booking.id}`);
    } catch (err) {
      setError(
        err.status === 409
          ? "Ghế đã được người khác giữ. Vui lòng chọn lại."
          : "Không thể hoàn tất yêu cầu. Hãy kiểm tra trạng thái đặt vé trước khi thử lại.",
      );

      invalidateSeats(showtimeId);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Đặt vé xem phim</h1>

      <SeatPicker
        loadingSeats={loadingSeats}
        seatsByRow={seatsByRow}
        selectedSeats={selectedSeats}
        onToggleSeat={handleToggleSeat}
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Thông tin đặt vé</h2>

        <p>Số lượng ghế: {selectedSeats.length}</p>

        <p>
          Ghế đã chọn:{" "}
          {selectedSeats
            .map((seat) => `${seat.row}${seat.number}`)
            .join(", ") || "Chưa chọn"}
        </p>

        {error && (
          <p role="alert" className="mt-3 text-red-500">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleBooking}
          disabled={submitting || loadingSeats || selectedSeats.length === 0}
          className="mt-5 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Đang tạo booking..." : "Tiếp tục thanh toán"}
        </button>
      </div>
    </main>
  );
}
