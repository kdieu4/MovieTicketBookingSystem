package com.mtbs.movie_service.messaging;

import java.util.List;

/** Ban tin booking-service phat khi booking da thanh toan. */
public class BookingPaidEvent {

    private Long bookingId;
    private Long showtimeId;
    private List<Long> seatIds;
    private String status;

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
    }

    public List<Long> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Long> seatIds) {
        this.seatIds = seatIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
