package com.mtbs.movie_service.domain.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record SeatClaimResponse(
        List<Long> seatIds,
        OffsetDateTime holdUntil,
        BigDecimal amount) {
}