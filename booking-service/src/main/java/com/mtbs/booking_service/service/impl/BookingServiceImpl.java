
package com.mtbs.booking_service.service.impl;

import com.mtbs.booking_service.client.MovieServiceClient;
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

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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

    // =====================================================
    // POST: TẠO BOOKING
    // =====================================================

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {

        userServiceClient.getUserById(request.getUserId());

        ShowtimeResponse showtime =
                movieServiceClient.getShowtimeById(
                        request.getShowtimeId()
                );

        List<SeatResponse> selectedSeats =
                validateSeats(request, showtime, null);

        BigDecimal totalAmount = showtime.getBasePrice()
                .multiply(BigDecimal.valueOf(selectedSeats.size()));

        Booking booking = new Booking();

        booking.setBookingCode(
                "BK-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        booking.setUserId(request.getUserId());
        booking.setShowtimeId(request.getShowtimeId());
        booking.setAmount(totalAmount.doubleValue());
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        saveBookingSeats(savedBooking, selectedSeats, showtime);

        // Gửi sự kiện RabbitMQ
        BookingCreatedEvent event = new BookingCreatedEvent();

        event.setBookingId(savedBooking.getBookingId());
        event.setUserId(savedBooking.getUserId());
        event.setShowtimeId(savedBooking.getShowtimeId());
        event.setSeatIds(request.getSeatIds());
        event.setAmount(savedBooking.getAmount());
        event.setStatus(savedBooking.getStatus().name());

        bookingEventProducer.publishBookingCreated(event);

        return convertToResponse(savedBooking);
    }

    // =====================================================
    // GET: LẤY DANH SÁCH BOOKING
    // =====================================================

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

    // =====================================================
    // GET: LẤY BOOKING THEO ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy booking có ID: " + id
                        )
                );

        return convertToResponse(booking);
    }

    // =====================================================
    // PUT: CẬP NHẬT BOOKING
    // =====================================================

    @Override
    @Transactional
    public BookingResponse updateBooking(
            Long id,
            CreateBookingRequest request) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy booking có ID: " + id
                        )
                );

        // Kiểm tra User
        userServiceClient.getUserById(request.getUserId());

        // Lấy Showtime mới
        ShowtimeResponse showtime =
                movieServiceClient.getShowtimeById(
                        request.getShowtimeId()
                );

        // Lấy danh sách ghế cũ của booking
        List<BookingSeat> oldBookingSeats =
                getBookingSeats(id);

        Set<Long> oldSeatIds = oldBookingSeats.stream()
                .map(BookingSeat::getShowtimeSeatId)
                .collect(Collectors.toSet());

        // Kiểm tra danh sách ghế mới
        List<SeatResponse> selectedSeats =
                validateSeats(request, showtime, oldSeatIds);

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

    // =====================================================
    // DELETE: XÓA BOOKING
    // =====================================================

    @Override
    @Transactional
    public void deleteBooking(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy booking có ID: " + id
                        )
                );

        // Xóa các ghế thuộc booking trước
        List<BookingSeat> bookingSeats = getBookingSeats(id);

        bookingSeatRepository.deleteAll(bookingSeats);

        // Sau đó xóa booking
        bookingRepository.delete(booking);
    }

    // =====================================================
    // HÀM HỖ TRỢ: KIỂM TRA GHẾ
    // =====================================================

    private List<SeatResponse> validateSeats(
            CreateBookingRequest request,
            ShowtimeResponse showtime,
            Set<Long> currentBookingSeatIds) {

        if (showtime == null || showtime.getRoomId() == null) {
            throw new InvalidSeatException(
                    "Không tìm thấy phòng chiếu của Showtime"
            );
        }

        if (request.getSeatIds() == null
                || request.getSeatIds().isEmpty()) {
            throw new InvalidSeatException(
                    "Vui lòng chọn ít nhất một ghế"
            );
        }

        Set<Long> uniqueSeatIds = new HashSet<>(
                request.getSeatIds()
        );

        if (uniqueSeatIds.size() != request.getSeatIds().size()) {
            throw new InvalidSeatException(
                    "Danh sách ghế có ghế bị trùng"
            );
        }

        List<SeatResponse> seats =
                movieServiceClient.getSeatsByShowtime(
                        request.getShowtimeId()
                );

        if (seats == null || seats.isEmpty()) {
            throw new InvalidSeatException(
                    "Phòng chiếu không có ghế"
            );
        }

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

            boolean alreadyBooked =
                    bookingSeatRepository
                            .existsByShowtimeIdAndShowtimeSeatId(
                                    request.getShowtimeId(),
                                    seatId
                            );

            // Nếu ghế thuộc booking đang cập nhật thì cho phép giữ lại
            boolean belongsToCurrentBooking =
                    currentBookingSeatIds != null
                            && currentBookingSeatIds.contains(seatId);

            if (alreadyBooked && !belongsToCurrentBooking) {
                throw new InvalidSeatException(
                        "Ghế " + seatId + " đã được đặt trước đó"
                );
            }

            selectedSeats.add(selectedSeat);
        }

        return selectedSeats;
    }

    // =====================================================
    // HÀM HỖ TRỢ: LƯU BOOKING SEATS
    // =====================================================

    private void saveBookingSeats(
            Booking booking,
            List<SeatResponse> selectedSeats,
            ShowtimeResponse showtime) {

        List<BookingSeat> bookingSeats = new ArrayList<>();

        for (SeatResponse selectedSeat : selectedSeats) {

            BookingSeat bookingSeat = new BookingSeat();

            bookingSeat.setBookingId(booking.getBookingId());
            bookingSeat.setShowtimeSeatId(selectedSeat.getId());
            bookingSeat.setPrice(showtime.getBasePrice());

            bookingSeats.add(bookingSeat);
        }

        bookingSeatRepository.saveAll(bookingSeats);
    }

    // =====================================================
    // HÀM HỖ TRỢ: LẤY GHẾ THEO BOOKING ID
    // =====================================================

    private List<BookingSeat> getBookingSeats(Long bookingId) {

        return bookingSeatRepository.findAll()
                .stream()
                .filter(seat ->
                        bookingId.equals(seat.getBookingId())
                )
                .collect(Collectors.toList());
    }

    // =====================================================
    // HÀM HỖ TRỢ: CHUYỂN BOOKING THÀNH RESPONSE
    // =====================================================

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
