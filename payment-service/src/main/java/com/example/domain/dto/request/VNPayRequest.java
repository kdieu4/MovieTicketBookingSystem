package com.example.domain.dto.request;

import java.math.BigDecimal;

public record VNPayRequest(
        Long bookingId,
        BigDecimal amount) {
}
