package com.mtbs.booking_service.scheduler;

import com.mtbs.booking_service.client.MovieSeatClaimClient;
import com.mtbs.booking_service.domain.entity.Booking;
import com.mtbs.booking_service.domain.entity.BookingStatus;
import com.mtbs.booking_service.repository.BookingRepository;
import com.mtbs.booking_service.repository.BookingSeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Chuyển các booking PENDING đã quá hạn giữ chỗ sang EXPIRED.
 *
 * Hạn giữ chỗ (paymentExpiresAt) được đặt lúc tạo booking, tính từ lúc giữ ghế.
 * Job chỉ đánh dấu trạng thái và trả ghế về Movie Service; không gia hạn gì.
 */
@Component
public class BookingExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingExpiryScheduler.class);

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final MovieSeatClaimClient seatClaimClient;

    // Số booking xử lý mỗi lượt để một lần quét không kéo dài
    @Value("${booking.expiry.batch-size:200}")
    private int batchSize;

    public BookingExpiryScheduler(
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            MovieSeatClaimClient seatClaimClient) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.seatClaimClient = seatClaimClient;
    }

    @Scheduled(fixedDelayString = "${booking.expiry.scan-interval-ms:60000}", initialDelayString = "${booking.expiry.initial-delay-ms:20000}")
    @Transactional
    public void expireOverdueBookings() {
        OffsetDateTime now = OffsetDateTime.now();

        List<Booking> overdue = bookingRepository.findByStatusAndPaymentExpiresAtBefore(
                BookingStatus.PENDING,
                now,
                PageRequest.of(0, batchSize));

        if (overdue.isEmpty()) {
            return;
        }

        for (Booking booking : overdue) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);

            // Trả ghế về trạng thái trống để người khác chọn được ngay
            try {
                List<Long> seatIds = bookingSeatRepository
                        .findByBooking_BookingId(booking.getBookingId())
                        .stream()
                        .map(seat -> seat.getShowtimeSeatId())
                        .toList();

                if (!seatIds.isEmpty()) {
                    seatClaimClient.releaseClaim(
                            booking.getShowtimeId(),
                            booking.getBookingId(),
                            seatIds);
                }
            } catch (Exception exception) {
                // Ghế đã hết hạn giữ nên Movie Service tự mở lại; lỗi ở đây không
                // được làm job dừng lại.
                log.warn("Không trả được ghế của booking {}: {}",
                        booking.getBookingId(),
                        exception.getMessage());
            }
        }

        log.info("Đã chuyển {} booking quá hạn sang EXPIRED", overdue.size());
    }
}