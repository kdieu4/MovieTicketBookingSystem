package com.mtbs.booking_service.service.impl;

import com.mtbs.booking_service.client.MovieSeatClaimClient;
import com.mtbs.booking_service.client.MovieServiceClient;
import com.mtbs.booking_service.client.UserServiceClient;
import com.mtbs.booking_service.domain.dto.response.BookingResponse;
import com.mtbs.booking_service.domain.dto.response.UserResponse;
import com.mtbs.booking_service.domain.entity.Booking;
import com.mtbs.booking_service.domain.entity.BookingStatus;
import com.mtbs.booking_service.exception.UserNotFoundException;
import com.mtbs.booking_service.messaging.BookingEventProducer;
import com.mtbs.booking_service.repository.BookingRepository;
import com.mtbs.booking_service.repository.BookingSeatRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Kiem tra quyen so huu booking o tang service, khong can DB.
 *
 * <p>Booking luu userId theo id ho so user-service, con JWT mang id tai khoan
 * auth. Test khoa ca hai cach danh so de du lieu cu van doc duoc.
 */
class BookingServiceImplSecurityTest {

    private static final Long AUTH_USER_ID = 10L;
    private static final Long PROFILE_ID = 99L;

    private UserServiceClient userServiceClient;
    private MovieServiceClient movieServiceClient;
    private BookingRepository bookingRepository;
    private BookingSeatRepository bookingSeatRepository;
    private BookingServiceImpl service;

    @BeforeEach
    void setUp() {
        userServiceClient = mock(UserServiceClient.class);
        movieServiceClient = mock(MovieServiceClient.class);
        bookingRepository = mock(BookingRepository.class);
        bookingSeatRepository = mock(BookingSeatRepository.class);

        service = new BookingServiceImpl(
                userServiceClient,
                movieServiceClient,
                bookingRepository,
                bookingSeatRepository,
                mock(BookingEventProducer.class),
                mock(MovieSeatClaimClient.class));

        UserResponse profile = new UserResponse();
        profile.setId(PROFILE_ID);
        when(userServiceClient.getUserByAuthUserId(AUTH_USER_ID)).thenReturn(profile);

        when(bookingSeatRepository.findByBooking_BookingId(anyLong())).thenReturn(List.of());
    }

    @Test
    @DisplayName("Chu so huu xem duoc booking luu theo id ho so")
    void getBookingById_chuSoHuu_traVeBooking() {
        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(booking(1L, PROFILE_ID, BookingStatus.PENDING)));

        BookingResponse response = service.getBookingById(1L, AUTH_USER_ID, false);

        assertThat(response.getBookingId()).isEqualTo(1L);
        assertThat(response.getUserId()).isEqualTo(PROFILE_ID);
    }

    @Test
    @DisplayName("Booking cu luu userId theo id tai khoan auth van nhan ra chu")
    void getBookingById_duLieuCuLuuAuthUserId_vanChoPhep() {
        when(bookingRepository.findById(2L))
                .thenReturn(Optional.of(booking(2L, AUTH_USER_ID, BookingStatus.PAID)));

        assertThat(service.getBookingById(2L, AUTH_USER_ID, false).getBookingId())
                .isEqualTo(2L);
    }

    @Test
    @DisplayName("Nguoi khac xem booking bi chan 403")
    void getBookingById_nguoiKhac_biChan() {
        when(bookingRepository.findById(3L))
                .thenReturn(Optional.of(booking(3L, 555L, BookingStatus.PENDING)));

        assertThatThrownBy(() -> service.getBookingById(3L, AUTH_USER_ID, false))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("ADMIN xem duoc booking cua nguoi khac")
    void getBookingById_admin_xemDuocMoiBooking() {
        when(bookingRepository.findById(4L))
                .thenReturn(Optional.of(booking(4L, 555L, BookingStatus.PENDING)));

        assertThat(service.getBookingById(4L, AUTH_USER_ID, true).getUserId())
                .isEqualTo(555L);
    }

    @Test
    @DisplayName("Xem danh sach booking cua nguoi khac bi chan 403")
    void getBookingsByUser_nguoiKhac_biChan() {
        assertThatThrownBy(() -> service.getBookingsByUser(555L, AUTH_USER_ID, false))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Danh sach cua chinh minh gop ca booking cu va moi, khong trung")
    void getBookingsByUser_chinhMinh_gopDuLieuCuVaMoi() {
        when(bookingRepository.findByUserIdOrderByBookingIdDesc(PROFILE_ID))
                .thenReturn(List.of(booking(7L, PROFILE_ID, BookingStatus.PAID)));
        when(bookingRepository.findByUserIdOrderByBookingIdDesc(AUTH_USER_ID))
                .thenReturn(List.of(
                        booking(5L, AUTH_USER_ID, BookingStatus.PAID),
                        booking(7L, PROFILE_ID, BookingStatus.PAID)));

        List<BookingResponse> result = service.getBookingsByUser(PROFILE_ID, AUTH_USER_ID, false);

        assertThat(result).extracting(BookingResponse::getBookingId)
                .containsExactly(7L, 5L);
    }

    @Test
    @DisplayName("Huy booking da thanh toan bi chan 409")
    void deleteBooking_daThanhToan_biChan() {
        when(bookingRepository.findById(8L))
                .thenReturn(Optional.of(booking(8L, PROFILE_ID, BookingStatus.PAID)));

        assertThatThrownBy(() -> service.deleteBooking(8L, AUTH_USER_ID, false))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("Huy booking cua nguoi khac bi chan 403")
    void deleteBooking_nguoiKhac_biChan() {
        when(bookingRepository.findById(9L))
                .thenReturn(Optional.of(booking(9L, 555L, BookingStatus.PENDING)));

        assertThatThrownBy(() -> service.deleteBooking(9L, AUTH_USER_ID, false))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("User Service loi thi khong mo quyen cho booking cua nguoi khac")
    void getBookingById_userServiceLoi_vanBiChan() {
        when(userServiceClient.getUserByAuthUserId(AUTH_USER_ID))
                .thenThrow(new UserNotFoundException("khong tim thay"));

        when(bookingRepository.findById(11L))
                .thenReturn(Optional.of(booking(11L, 555L, BookingStatus.PENDING)));

        assertThatThrownBy(() -> service.getBookingById(11L, AUTH_USER_ID, false))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    private static Booking booking(Long id, Long userId, BookingStatus status) {
        Booking booking = new Booking();
        booking.setBookingId(id);
        booking.setUserId(userId);
        booking.setStatus(status);
        return booking;
    }
}