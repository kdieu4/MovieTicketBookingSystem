package com.mtbs.booking_service.repository;

import com.mtbs.booking_service.domain.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByClientRequestId(String clientRequestId);
}