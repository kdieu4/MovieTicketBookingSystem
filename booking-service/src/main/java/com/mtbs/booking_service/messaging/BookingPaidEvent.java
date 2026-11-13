
package com.mtbs.booking_service.messaging;

public class BookingPaidEvent {

    private Long bookingId;
    private Long showtimeId;
    private java.util.List<Long> seatIds;
    private String status;

    public BookingPaidEvent() {
    }

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

    public java.util.List<Long> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(java.util.List<Long> seatIds) {
        this.seatIds = seatIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
