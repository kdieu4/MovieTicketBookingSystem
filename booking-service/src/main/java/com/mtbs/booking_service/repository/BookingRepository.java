package com.mtbs.booking_service.repository;

import com.mtbs.booking_service.domain.entity.Booking;
import com.mtbs.booking_service.domain.entity.BookingStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByClientRequestId(String clientRequestId);

    List<Booking> findByUserIdOrderByBookingIdDesc(Long userId);

    // Dùng cho job đánh dấu booking quá hạn giữ chỗ
    List<Booking> findByStatusAndPaymentExpiresAtBefore(
            BookingStatus status,
            OffsetDateTime time,
            Pageable pageable);
}