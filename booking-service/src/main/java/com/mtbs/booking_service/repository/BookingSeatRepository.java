package com.mtbs.booking_service.repository;

import com.mtbs.booking_service.domain.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    @Query("""
        SELECT COUNT(bs) > 0
        FROM BookingSeat bs
        JOIN Booking b ON b.bookingId = bs.bookingId
        WHERE b.showtimeId = :showtimeId
          AND bs.showtimeSeatId = :showtimeSeatId
    """)
    boolean existsByShowtimeIdAndShowtimeSeatId(
            @Param("showtimeId") Long showtimeId,
            @Param("showtimeSeatId") Long showtimeSeatId
    );
}