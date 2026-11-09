import { apiRequest } from "./apiClient";

export async function createMoMoPayment(
  bookingId,
  token
) {
  return apiRequest("/api/payments/momo/checkout", {
    method: "POST",
    token,
    body: {
      bookingId,
    },
  });
}