// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// export async function createBooking(bookingData, token) {
//   console.log("Booking API - Has Token:", Boolean(token));
//   const response = await fetch(`http://localhost:8082/api/bookings`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     },
//     body: JSON.stringify(bookingData),
//     cache: "no-store",
//   });

//   const data = await response.json().catch(() => null);

//   if (!response.ok) {
//     const error = new Error(
//       data?.message || `Không thể tạo Booking (HTTP ${response.status})`,
//     );

//     error.status = response.status;

//     throw error;
//   }

//   if (!data?.bookingId) {
//     throw new Error("Booking Service không trả về bookingId");
//   }

//   return data;
// }

export async function createBooking(bookingData) {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(bookingData),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message || `Không thể tạo Booking (HTTP ${response.status})`,
    );

    error.status = response.status;
    throw error;
  }

  if (!data?.bookingId) {
    throw new Error("Booking Service không trả về bookingId");
  }
  return data;
}
