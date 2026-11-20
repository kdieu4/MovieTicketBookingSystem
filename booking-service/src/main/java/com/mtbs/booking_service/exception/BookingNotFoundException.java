package com.mtbs.booking_service.exception;

/**
 * Booking khong ton tai. Tra 404 thay vi 500 de dung ngu nghia HTTP va de
 * payment-service phan biet "khong tim thay" voi "khong co quyen".
 */
public class BookingNotFoundException extends RuntimeException {

    public BookingNotFoundException(Long bookingId) {
        super("Khong tim thay booking co ID: " + bookingId);
    }
}
