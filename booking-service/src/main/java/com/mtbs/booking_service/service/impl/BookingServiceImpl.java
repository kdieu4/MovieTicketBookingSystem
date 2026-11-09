package com.mtbs.booking_service.service.impl;

import com.mtbs.booking_service.client.MovieServiceClient;
import com.mtbs.booking_service.client.MovieSeatClaimClient;
import com.mtbs.booking_service.client.UserServiceClient;

import com.mtbs.booking_service.domain.dto.request.CreateBookingRequest;
import com.mtbs.booking_service.domain.dto.response.BookingResponse;
import com.mtbs.booking_service.domain.entity.Booking;
import com.mtbs.booking_service.domain.entity.BookingSeat;
import com.mtbs.booking_service.domain.entity.BookingStatus;

import com.mtbs.booking_service.exception.InvalidSeatException;
import com.mtbs.booking_service.messaging.BookingCreatedEvent;
import com.mtbs.booking_service.messaging.BookingEventProducer;

import com.mtbs.booking_service.repository.BookingRepository;
import com.mtbs.booking_service.repository.BookingSeatRepository;
import com.mtbs.booking_service.service.BookingService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

        private final UserServiceClient userServiceClient;
        private final MovieServiceClient movieServiceClient;
        private final MovieSeatClaimClient seatClaimClient;

        private final BookingRepository bookingRepository;
        private final BookingSeatRepository bookingSeatRepository;

        private final BookingEventProducer bookingEventProducer;

        @Override
        @Transactional
        public BookingResponse createBooking(CreateBookingRequest request) {

                // 1. Kiểm tra request trùng
                var existing = bookingRepository
                                .findByClientRequestId(request.getRequestId());

                if (existing.isPresent()) {
                        return toResponse(existing.get());
                }

                // 2. Kiểm tra danh sách ghế
                List<Long> seatIds = request.getSeatIds();

                if (seatIds == null
                                || seatIds.isEmpty()
                                || seatIds.stream().distinct().count() != seatIds.size()) {
                        throw new InvalidSeatException(
                                        "Danh sách ghế không hợp lệ");
                }

                // 3. Kiểm tra người dùng
                userServiceClient.getUserById(request.getUserId());

                // 4. Kiểm tra suất chiếu
                var showtime = movieServiceClient
                                .getShowtimeById(request.getShowtimeId());

                if (showtime == null || showtime.getRoomId() == null) {
                        throw new InvalidSeatException(
                                        "Suất chiếu không hợp lệ");
                }

                // 5. Tạo Booking PENDING
                Booking booking = new Booking();

                booking.setBookingCode(
                                "BK-" + UUID.randomUUID()
                                                .toString()
                                                .substring(0, 8)
                                                .toUpperCase());

                booking.setClientRequestId(request.getRequestId());
                booking.setUserId(request.getUserId());
                booking.setShowtimeId(request.getShowtimeId());

                // Giá tạm thời; sẽ thay bằng giá được Movie Service xác nhận
                BigDecimal provisionalAmount = showtime.getBasePrice()
                                .multiply(
                                                BigDecimal.valueOf(seatIds.size()));

                booking.setAmount(provisionalAmount.doubleValue());
                booking.setStatus(BookingStatus.PENDING);

                Booking savedBooking = bookingRepository.saveAndFlush(booking);

                boolean claimed = false;

                try {
                        // 6. Chuyển quyền giữ ghế sang Booking
                        var claim = seatClaimClient.claimSeats(
                                        request.getShowtimeId(),
                                        savedBooking.getBookingId(),
                                        request.getSessionId(),
                                        seatIds);

                        if (claim == null
                                        || claim.amount() == null
                                        || claim.seatIds() == null
                                        || claim.seatIds().size() != seatIds.size()) {
                                throw new InvalidSeatException(
                                                "Movie Service không xác nhận đủ ghế");
                        }

                        claimed = true;

                        // 7. Cập nhật giá chính thức
                        savedBooking.setAmount(claim.amount().doubleValue());
                        savedBooking.setPaymentExpiresAt(claim.holdUntil());

                        // 8. Lưu các ghế thuộc Booking
                        List<BookingSeat> bookingSeats = seatIds
                                        .stream()
                                        .map(seatId -> {
                                                BookingSeat item = new BookingSeat();
                                                item.setBooking(savedBooking);
                                                item.setShowtimeSeatId(seatId);
                                                return item;
                                        })
                                        .toList();

                        bookingSeatRepository.saveAll(bookingSeats);

                        bookingRepository.saveAndFlush(savedBooking);

                        // 9. Chuẩn bị sự kiện Booking
                        BookingCreatedEvent event = new BookingCreatedEvent();

                        event.setBookingId(savedBooking.getBookingId());
                        event.setUserId(savedBooking.getUserId());
                        event.setShowtimeId(savedBooking.getShowtimeId());
                        event.setSeatIds(seatIds);
                        event.setAmount(savedBooking.getAmount());
                        event.setStatus(savedBooking.getStatus().name());

                        // MVP: giữ cơ chế publish hiện tại.
                        // Production: thay bằng Transactional Outbox.
                        bookingEventProducer.publishBookingCreated(event);

                        // 10. Trả kết quả
                        return toResponse(savedBooking);

                } catch (RuntimeException exception) {

                        // Cố gắng bù trừ nếu đã chuyển quyền giữ ghế
                        if (claimed) {
                                try {
                                        seatClaimClient.releaseClaim(
                                                        request.getShowtimeId(),
                                                        savedBooking.getBookingId(),
                                                        seatIds);
                                } catch (Exception compensationError) {
                                        // Cần ghi log/metric và có tác vụ reconciliation.
                                        // Ghế còn được bảo vệ tạm thời bởi holdUntil.
                                }
                        }

                        throw exception;
                }
        }

        private BookingResponse toResponse(Booking booking) {

                BookingResponse response = new BookingResponse();

                response.setBookingId(booking.getBookingId());
                response.setUserId(booking.getUserId());
                response.setShowtimeId(booking.getShowtimeId());
                response.setAmount(booking.getAmount());
                response.setStatus(booking.getStatus());
                response.setHoldUntil(booking.getPaymentExpiresAt());

                response.setSeatIds(
                                bookingSeatRepository
                                                .findByBooking_BookingId(
                                                                booking.getBookingId())
                                                .stream()
                                                .map(BookingSeat::getShowtimeSeatId)
                                                .toList());

                return response;
        }
}