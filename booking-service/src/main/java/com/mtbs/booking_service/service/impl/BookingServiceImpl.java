
package com.mtbs.booking_service.service.impl;

import com.mtbs.booking_service.client.MovieServiceClient;
import com.mtbs.booking_service.client.MovieSeatClaimClient;
import com.mtbs.booking_service.client.UserServiceClient;
import com.mtbs.booking_service.domain.dto.request.CreateBookingRequest;
import com.mtbs.booking_service.domain.dto.response.BookingResponse;
import com.mtbs.booking_service.domain.dto.response.SeatResponse;
import com.mtbs.booking_service.domain.dto.response.ShowtimeResponse;
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

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

        private final UserServiceClient userServiceClient;
        private final MovieServiceClient movieServiceClient;
        private final BookingRepository bookingRepository;
        private final BookingSeatRepository bookingSeatRepository;
        private final BookingEventProducer bookingEventProducer;
        private final MovieSeatClaimClient seatClaimClient;

        @Override
        @Transactional
        public BookingResponse createBooking(CreateBookingRequest request) {

                var userProfile = userServiceClient.getUserByAuthUserId(request.getUserId());

                Long profileUserId = userProfile.getId();

                var existing = bookingRepository.findByClientRequestId(request.getRequestId());

                if (existing.isPresent()) {
                        if (!profileUserId.equals(existing.get().getUserId())) {
                                throw new ResponseStatusException(HttpStatus.CONFLICT,
                                                "requestId đã được sử dụng bởi người dùng khác");
                        }
                        return convertToResponse(existing.get());
                }

                List<Long> seatIds = request.getSeatIds();

                if (seatIds == null || seatIds.isEmpty() || seatIds.stream().distinct().count() != seatIds.size()) {
                        throw new InvalidSeatException("Danh sách ghế không hợp lệ");
                }

                var showtime = movieServiceClient.getShowtimeById(request.getShowtimeId());

                if (showtime == null || showtime.getRoomId() == null) {
                        throw new InvalidSeatException("Suất chiếu không hợp lệ");
                }

                Booking booking = new Booking();

                booking.setBookingCode(
                                "BK-" + UUID.randomUUID()
                                                .toString()
                                                .substring(0, 8)
                                                .toUpperCase());

                booking.setClientRequestId(request.getRequestId());
                booking.setUserId(profileUserId);
                booking.setShowtimeId(request.getShowtimeId());

                BigDecimal provisionalAmount = showtime.getBasePrice().multiply(BigDecimal.valueOf(seatIds.size()));

                booking.setAmount(provisionalAmount.doubleValue());
                booking.setStatus(BookingStatus.PENDING);

                Booking savedBooking = bookingRepository.saveAndFlush(booking);

                boolean claimed = false;

                try {
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

                        savedBooking.setAmount(claim.amount().doubleValue());
                        savedBooking.setPaymentExpiresAt(claim.holdUntil());

                        List<BookingSeat> bookingSeats = seatIds.stream()
                                        .map(seatId -> {
                                                BookingSeat item = new BookingSeat();
                                                item.setBooking(savedBooking);
                                                item.setShowtimeSeatId(seatId);
                                                return item;
                                        })
                                        .toList();

                        bookingSeatRepository.saveAll(bookingSeats);
                        bookingRepository.saveAndFlush(savedBooking);

                        BookingCreatedEvent event = new BookingCreatedEvent();

                        event.setBookingId(savedBooking.getBookingId());
                        event.setUserId(savedBooking.getUserId());
                        event.setShowtimeId(savedBooking.getShowtimeId());
                        event.setSeatIds(seatIds);
                        event.setAmount(savedBooking.getAmount());
                        event.setStatus(savedBooking.getStatus().name());

                        bookingEventProducer.publishBookingCreated(event);

                        return convertToResponse(savedBooking);

                } catch (RuntimeException exception) {

                        if (claimed) {
                                try {
                                        seatClaimClient.releaseClaim(
                                                        request.getShowtimeId(),
                                                        savedBooking.getBookingId(),
                                                        seatIds);
                                } catch (Exception compensationError) {
                                        exception.addSuppressed(compensationError);
                                }
                        }

                        throw exception;
                }

        }

        @Override
        @Transactional(readOnly = true)
        public List<BookingResponse> getAllBookings() {

                List<Booking> bookings = bookingRepository.findAll();

                List<BookingResponse> responses = new ArrayList<>();

                for (Booking booking : bookings) {
                        responses.add(convertToResponse(booking));
                }

                return responses;
        }

        @Override
        @Transactional(readOnly = true)
        public BookingResponse getBookingById(Long id) {

                Booking booking = bookingRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Không tìm thấy booking có ID: " + id));

                return convertToResponse(booking);
        }

        @Override
        @Transactional
        public BookingResponse updateBooking(
                        Long id,
                        CreateBookingRequest request) {

                Booking booking = bookingRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Không tìm thấy booking có ID: " + id));

                // Kiểm tra User
                userServiceClient.getUserById(request.getUserId());

                // Lấy Showtime mới
                ShowtimeResponse showtime = movieServiceClient.getShowtimeById(
                                request.getShowtimeId());

                // Lấy danh sách ghế cũ của booking
                List<BookingSeat> oldBookingSeats = getBookingSeats(id);

                Set<Long> oldSeatIds = oldBookingSeats.stream()
                                .map(BookingSeat::getShowtimeSeatId)
                                .collect(Collectors.toSet());

                // Kiểm tra danh sách ghế mới
                List<SeatResponse> selectedSeats = validateSeats(request, showtime, oldSeatIds);

                // Xóa chi tiết ghế cũ
                bookingSeatRepository.deleteAll(oldBookingSeats);

                // Cập nhật thông tin booking
                BigDecimal totalAmount = showtime.getBasePrice()
                                .multiply(BigDecimal.valueOf(selectedSeats.size()));

                booking.setUserId(request.getUserId());
                booking.setShowtimeId(request.getShowtimeId());
                booking.setAmount(totalAmount.doubleValue());

                Booking updatedBooking = bookingRepository.save(booking);

                // Lưu lại các ghế mới
                saveBookingSeats(updatedBooking, selectedSeats, showtime);

                return convertToResponse(updatedBooking);
        }

        @Override
        @Transactional
        public void deleteBooking(Long id) {

                Booking booking = bookingRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Không tìm thấy booking có ID: " + id));

                // Xóa các ghế thuộc booking trước
                List<BookingSeat> bookingSeats = getBookingSeats(id);

                bookingSeatRepository.deleteAll(bookingSeats);

                // Sau đó xóa booking
                bookingRepository.delete(booking);
        }

        private List<SeatResponse> validateSeats(
                        CreateBookingRequest request,
                        ShowtimeResponse showtime,
                        Set<Long> currentBookingSeatIds) {

                List<Long> seatIds = request.getSeatIds();

                if (showtime == null || showtime.getRoomId() == null) {
                        throw new InvalidSeatException("Suất chiếu không hợp lệ");
                }

                if (seatIds == null || seatIds.isEmpty()
                                || seatIds.stream().anyMatch(id -> id == null || id <= 0)) {
                        throw new InvalidSeatException("Danh sách ghế không hợp lệ");
                }

                if (new HashSet<>(seatIds).size() != seatIds.size()) {
                        throw new InvalidSeatException("Danh sách ghế bị trùng");
                }

                List<SeatResponse> availableSeats = movieServiceClient.getSeatsByShowtime(request.getShowtimeId());

                if (availableSeats == null) {
                        throw new InvalidSeatException("Không thể lấy danh sách ghế");
                }

                return seatIds.stream()
                                .map(id -> availableSeats.stream()
                                                .filter(seat -> id.equals(seat.getId()))
                                                .findFirst()
                                                .orElseThrow(() -> new InvalidSeatException("Ghế không hợp lệ: " + id)))
                                .toList();
        }

        private void saveBookingSeats(
                        Booking booking,
                        List<SeatResponse> selectedSeats,
                        ShowtimeResponse showtime) {

                List<BookingSeat> bookingSeats = new ArrayList<>();

                for (SeatResponse selectedSeat : selectedSeats) {

                        BookingSeat bookingSeat = new BookingSeat();

                        bookingSeat.setBooking(booking);
                        bookingSeat.setShowtimeSeatId(selectedSeat.getId());
                        bookingSeat.setPrice(showtime.getBasePrice());

                        bookingSeats.add(bookingSeat);
                }

                bookingSeatRepository.saveAll(bookingSeats);
        }

        private List<BookingSeat> getBookingSeats(Long bookingId) {
                return bookingSeatRepository.findByBooking_BookingId(bookingId);
        }

        private BookingResponse convertToResponse(Booking booking) {

                BookingResponse response = new BookingResponse();

                response.setBookingId(booking.getBookingId());
                response.setUserId(booking.getUserId());
                response.setShowtimeId(booking.getShowtimeId());
                response.setAmount(booking.getAmount());
                response.setStatus(booking.getStatus());

                List<Long> seatIds = getBookingSeats(booking.getBookingId())
                                .stream()
                                .map(BookingSeat::getShowtimeSeatId)
                                .collect(Collectors.toList());

                response.setSeatIds(seatIds);

                return response;
        }
}
