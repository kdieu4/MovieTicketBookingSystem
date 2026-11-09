package com.mtbs.booking_service.domain.dto.response;

import com.mtbs.booking_service.domain.entity.BookingStatus;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
public class BookingResponse {

    private Long bookingId;

    private Long userId;

    private Long showtimeId;

    private List<Long> seatIds;

    private double amount;

    private BookingStatus status;

    private OffsetDateTime holdUntil;

    public BookingResponse() {
    }

}