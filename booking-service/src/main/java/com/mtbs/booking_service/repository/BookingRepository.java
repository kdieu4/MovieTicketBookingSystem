package com.mtbs.booking_service.repository;

import com.mtbs.booking_service.domain.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}