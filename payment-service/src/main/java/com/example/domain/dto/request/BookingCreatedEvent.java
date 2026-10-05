package com.example.domain.dto.request;

import java.math.BigDecimal;
import java.util.List;

public record BookingCreatedEvent(
        Long bookingId,
        Long userId,
        Long showTimeId,
        List<Long> seatIds,
        BigDecimal amount
) {
}
