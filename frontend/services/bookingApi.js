import { apiRequest } from "./apiClient";

/**
 * Tạo đơn đặt vé
 *
 * @param {Object} bookingData
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function createBooking(bookingData, token) {
  return apiRequest("http://localhost:8082/api/bookings", {
    method: "POST",
    token,
    body: bookingData,
  });
}

/**
 * Lấy thông tin booking theo ID
 *
 * @param {number|string} bookingId
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function getBooking(bookingId, token) {
  return apiRequest(`http://localhost:8082/api/bookings/${bookingId}`, {
    method: "GET",
    token,
  });
}