package com.mtbs.booking_service.domain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
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

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

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

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}