package com.mtbs.booking_service.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "booking_details", uniqueConstraints = @UniqueConstraint(columnNames = { "booking_id",
        "showtime_seat_id" }))
@Getter
@Setter
@NoArgsConstructor
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_detail_id")
    private Long bookingDetailId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "showtime_seat_id", nullable = false)
    private Long showtimeSeatId;

    private double price;

    public Long getBookingDetailId() {
        return bookingDetailId;
    }

    public void setBookingDetailId(Long bookingDetailId) {
        this.bookingDetailId = bookingDetailId;
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