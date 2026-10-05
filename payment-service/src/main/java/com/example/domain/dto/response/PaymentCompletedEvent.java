package com.example.domain.dto.response;

import com.example.domain.entity.Payment;
import com.example.domain.entity.PaymentStatus;

public record PaymentCompletedEvent(
        Long paymentId,
        Long bookingId,
        PaymentStatus status
) {
    public static PaymentCompletedEvent from(Payment payment) {
        return new PaymentCompletedEvent(payment.getId(), payment.getBookingId(), payment.getStatus());
    }
}
