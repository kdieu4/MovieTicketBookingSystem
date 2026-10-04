package com.mtbs.booking_service.service.impl;

import com.mtbs.booking_service.client.MovieServiceClient;
import com.mtbs.booking_service.client.UserServiceClient;
import com.mtbs.booking_service.domain.dto.request.CreateBookingRequest;
import com.mtbs.booking_service.domain.dto.response.BookingResponse;
import com.mtbs.booking_service.domain.dto.response.SeatResponse;
import com.mtbs.booking_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.booking_service.domain.entity.Booking;
import com.mtbs.booking_service.domain.entity.BookingSeat;
import com.mtbs.booking_service.exception.InvalidSeatException;
import com.mtbs.booking_service.exception.SeatAlreadyBookedException;
import com.mtbs.booking_service.messaging.BookingCreatedEvent;
import com.mtbs.booking_service.messaging.BookingEventProducer;
import com.mtbs.booking_service.repository.BookingRepository;
import com.mtbs.booking_service.repository.BookingSeatRepository;
import com.mtbs.booking_service.service.BookingService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final UserServiceClient userServiceClient;
    private final MovieServiceClient movieServiceClient;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BookingEventProducer bookingEventProducer;

    public BookingServiceImpl(
            UserServiceClient userServiceClient,
            MovieServiceClient movieServiceClient,
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            BookingEventProducer bookingEventProducer) {

        this.userServiceClient = userServiceClient;
        this.movieServiceClient = movieServiceClient;
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.bookingEventProducer = bookingEventProducer;
    }

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {

        // STEP 4: Kiểm tra User
        userServiceClient.getUserById(request.getUserId());

        // STEP 5: Lấy thông tin Showtime
        ShowtimeResponse showtime =
                movieServiceClient.getShowtimeById(request.getShowtimeId());

        if (showtime == null || showtime.getRoomId() == null) {
            throw new InvalidSeatException(
                    "Không tìm thấy phòng chiếu của Showtime"
            );
        }

        // STEP 6: Lấy danh sách ghế của phòng
        List<SeatResponse> seats =
                movieServiceClient.getSeatsByRoomId(showtime.getRoomId());

        // STEP 7: Kiểm tra tất cả ghế
        List<SeatResponse> selectedSeats = new ArrayList<>();

        for (Long seatId : request.getSeatIds()) {

            SeatResponse selectedSeat = seats.stream()
                    .filter(seat -> seatId.equals(seat.getSeatId()))
                    .findFirst()
                    .orElseThrow(() ->
                            new InvalidSeatException(
                                    "Ghế " + seatId +
                                    " không thuộc phòng chiếu"
                            )
                    );

            // Kiểm tra trạng thái ghế
            if ("BOOKED".equalsIgnoreCase(selectedSeat.getStatus())) {

                throw new SeatAlreadyBookedException(
                        "Ghế " + seatId +
                        " đã được đặt cho suất chiếu này"
                );
            }

            // Kiểm tra ghế đã được đặt trong Booking Details chưa
            if (selectedSeat.getShowtimeSeatId() != null
                    && bookingSeatRepository
                    .existsByShowtimeIdAndShowtimeSeatId(
                            request.getShowtimeId(),
                            selectedSeat.getShowtimeSeatId())) {

                throw new SeatAlreadyBookedException(
                        "Ghế " + seatId +
                        " đã được đặt cho suất chiếu này"
                );
            }

            selectedSeats.add(selectedSeat);
        }

        // STEP 8: TẠO BOOKING
        Booking booking = new Booking();

        booking.setUserId(request.getUserId());
        booking.setShowtimeId(request.getShowtimeId());

        double totalAmount = 0;

        for (SeatResponse seat : selectedSeats) {

            if (seat.getPrice() != null) {
                totalAmount += seat.getPrice();
            }
        }

        booking.setAmount(totalAmount);
        booking.setStatus("PENDING");

        Booking savedBooking = bookingRepository.save(booking);

        // Tạo BOOKING_DETAILS
        for (SeatResponse seat : selectedSeats) {

            BookingSeat bookingSeat = new BookingSeat();

            bookingSeat.setBookingId(
                    savedBooking.getBookingId()
            );

            bookingSeat.setShowtimeSeatId(
                    seat.getShowtimeSeatId()
            );

            if (seat.getPrice() != null) {
                bookingSeat.setPrice(seat.getPrice());
            }

            bookingSeatRepository.save(bookingSeat);
        }

        // STEP 9: Phát sự kiện BookingCreated
        BookingCreatedEvent event = new BookingCreatedEvent();

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

        event.setStatus(
                savedBooking.getStatus()
        );

        bookingEventProducer.publishBookingCreated(event);

        // Tạo response
        BookingResponse response = new BookingResponse();

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

        response.setStatus(
                savedBooking.getStatus()
        );

        return response;
    }
}