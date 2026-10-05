package com.mtbs.booking_service.service.impl;

import com.mtbs.booking_service.client.MovieServiceClient;
import com.mtbs.booking_service.client.UserServiceClient;
import com.mtbs.booking_service.domain.dto.request.CreateBookingRequest;
import com.mtbs.booking_service.domain.dto.response.BookingResponse;
import com.mtbs.booking_service.domain.dto.response.SeatResponse;
import com.mtbs.booking_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.booking_service.domain.entity.Booking;
import com.mtbs.booking_service.domain.entity.BookingStatus;
import com.mtbs.booking_service.exception.InvalidSeatException;
import com.mtbs.booking_service.messaging.BookingCreatedEvent;
import com.mtbs.booking_service.messaging.BookingEventProducer;
import com.mtbs.booking_service.repository.BookingRepository;
import com.mtbs.booking_service.service.BookingService;

import java.util.UUID;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final UserServiceClient userServiceClient;
    private final MovieServiceClient movieServiceClient;
    private final BookingRepository bookingRepository;
    private final BookingEventProducer bookingEventProducer;

    public BookingServiceImpl(
            UserServiceClient userServiceClient,
            MovieServiceClient movieServiceClient,
            BookingRepository bookingRepository,
            BookingEventProducer bookingEventProducer) {

        this.userServiceClient = userServiceClient;
        this.movieServiceClient = movieServiceClient;
        this.bookingRepository = bookingRepository;
        this.bookingEventProducer = bookingEventProducer;
    }

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {

        /*
         * STEP 1: Kiểm tra User
         */
        userServiceClient.getUserById(request.getUserId());

        /*
         * STEP 2: Lấy Showtime từ Movie Service
         */
        ShowtimeResponse showtime =
                movieServiceClient.getShowtimeById(request.getShowtimeId());

        if (showtime == null || showtime.getRoomId() == null) {
            throw new InvalidSeatException(
                    "Không tìm thấy phòng chiếu của Showtime"
            );
        }

        /*
         * STEP 3: Lấy danh sách ghế thuộc phòng của Showtime
         */
        List<SeatResponse> seats =
                movieServiceClient.getSeatsByRoomId(
                        showtime.getRoomId()
                );

        if (seats == null || seats.isEmpty()) {
            throw new InvalidSeatException(
                    "Phòng chiếu không có ghế"
            );
        }

        /*
         * STEP 4: Kiểm tra các seatId gửi lên
         */
        List<SeatResponse> selectedSeats = new ArrayList<>();

        for (Long seatId : request.getSeatIds()) {

            SeatResponse selectedSeat = seats.stream()
                    .filter(seat ->
                            seat.getId() != null
                                    && seatId.equals(seat.getId())
                    )
                    .findFirst()
                    .orElseThrow(() ->
                            new InvalidSeatException(
                                    "Ghế " + seatId
                                            + " không thuộc phòng chiếu "
                                            + showtime.getRoomId()
                            )
                    );

            selectedSeats.add(selectedSeat);
        }

        /*
         * STEP 5: Tính tổng tiền
         */
        double totalAmount = showtime.getBasePrice()
                .multiply(
                        BigDecimal.valueOf(selectedSeats.size())
                )
                .doubleValue();

        /*
         * STEP 6: Tạo Booking PENDING
         */
        Booking booking = new Booking();

        booking.setBookingCode(
                "BK-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        booking.setUserId(request.getUserId());
        booking.setShowtimeId(request.getShowtimeId());
        booking.setAmount(totalAmount);
        booking.setStatus(BookingStatus.PENDING);

        System.out.println(
                "Booking code = " + booking.getBookingCode()
        );

        Booking savedBooking =
                bookingRepository.save(booking);

        /*
         * STEP 7:
         * Tạm thời chưa lưu BookingSeat.
         */

        /*
         * STEP 8: Publish BookingCreatedEvent
         */
        BookingCreatedEvent event =
                new BookingCreatedEvent();

        event.setBookingId(
                savedBooking.getBookingId()
        );

        event.setUserId(
                savedBooking.getUserId()
        );

        event.setShowtimeId(
                savedBooking.getShowtimeId()
        );

        event.setSeatIds(
                request.getSeatIds()
        );

        event.setAmount(
                savedBooking.getAmount()
        );

        /*
         * BookingCreatedEvent.status là String,
         * Booking.status là BookingStatus.
         *
         * BookingStatus.PENDING -> "PENDING"
         */
        event.setStatus(
                savedBooking.getStatus().name()
        );

        bookingEventProducer.publishBookingCreated(event);

        /*
         * STEP 9: Tạo response
         */
        BookingResponse response =
                new BookingResponse();

        response.setBookingId(
                savedBooking.getBookingId()
        );

        response.setUserId(
                savedBooking.getUserId()
        );

        response.setShowtimeId(
                savedBooking.getShowtimeId()
        );

        response.setSeatIds(
                request.getSeatIds()
        );

        response.setAmount(
                savedBooking.getAmount()
        );

        /*
         * BookingResponse.status đã là BookingStatus
         */
        response.setStatus(
                savedBooking.getStatus()
        );

        return response;
    }
}