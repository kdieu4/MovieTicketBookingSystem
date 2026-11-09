// import { apiRequest } from "./apiClient";
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
// /**
//  * Tạo đơn đặt vé
//  *
//  * @param {Object} bookingData
//  * @param {string} token
//  * @returns {Promise<Object>}
//  */
// export async function createBooking(bookingData, token) {
//   return apiRequest("http://localhost:8082/api/bookings", {
//     method: "POST",
//     token,
//     body: bookingData,
//   });
// }

// /**
//  * Lấy thông tin booking theo ID
//  *
//  * @param {number|string} bookingId
//  * @param {string} token
//  * @returns {Promise<Object>}
//  */
// export async function getBooking(bookingId, token) {
//   return apiRequest(`http://localhost:8082/api/bookings/${bookingId}`, {
//     method: "GET",
//     token,
//   });
// }

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function createBooking(bookingData, token) {
  const response = await fetch(`http://localhost:8082/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
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
