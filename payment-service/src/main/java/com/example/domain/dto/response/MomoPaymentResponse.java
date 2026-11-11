package com.example.domain.dto.response;

public record MomoPaymentResponse(
        String partnerCode,
        String orderId,
        String requestId,
        long amount,
        long responseTime,
        String message,
        int resultCode,
        String payUrl,
        String deeplink,
        String qrCodeUrl
) {
}
