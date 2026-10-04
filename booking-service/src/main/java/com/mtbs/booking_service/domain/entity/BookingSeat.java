package com.mtbs.booking_service.domain.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "booking_details")
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingDetailId;

    private Long bookingId;

    private Long showtimeSeatId;

    private double price;

    public BookingSeat() {
    }

    public Long getBookingDetailId() {
        return bookingDetailId;
    }

    public void setBookingDetailId(Long bookingDetailId) {
        this.bookingDetailId = bookingDetailId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getShowtimeSeatId() {
        return showtimeSeatId;
    }

    public void setShowtimeSeatId(Long showtimeSeatId) {
        this.showtimeSeatId = showtimeSeatId;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}