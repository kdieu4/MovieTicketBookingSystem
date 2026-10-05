package com.example.domain.dto.response;

import com.example.domain.entity.Payment;
import com.example.domain.entity.PaymentStatus;

import java.math.BigDecimal;

public record PaymentResponse(
        Long id,
        Long bookingId,
        BigDecimal amount,
        PaymentStatus paymentStatus
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(payment.getId(), payment.getBookingId(), payment.getAmount(), payment.getStatus());
    }
}
