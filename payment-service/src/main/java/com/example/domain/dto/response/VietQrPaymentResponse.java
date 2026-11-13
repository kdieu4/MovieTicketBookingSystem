package com.example.domain.dto.response;

import java.math.BigDecimal;

public record VietQrPaymentResponse(
        Long id,
        Long bookingId,
        BigDecimal amount,
        String qrUrl
) {
    public static VietQrPaymentResponse from(Long id, Long bookingId, BigDecimal amount, String qrUrl) {
        return new VietQrPaymentResponse(id, bookingId, amount, qrUrl);
    }
}
