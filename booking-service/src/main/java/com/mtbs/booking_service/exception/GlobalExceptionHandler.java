package com.mtbs.booking_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // User không tồn tại
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(
            UserNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "error", "USER_NOT_FOUND",
                        "message", ex.getMessage()
                ));
    }


    // Booking không tồn tại
    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBookingNotFound(
            BookingNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "error", "BOOKING_NOT_FOUND",
                        "message", ex.getMessage()
                ));
    }


    // movie-service từ chối giữ ghế / xác nhận ghế: giữ nguyên 409 thay vì 500
    @ExceptionHandler(HttpClientErrorException.Conflict.class)
    public ResponseEntity<Map<String, String>> handleSeatConflict(
            HttpClientErrorException.Conflict ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", "SEAT_ALREADY_BOOKED",
                        "message", "Một hoặc nhiều ghế không còn giữ được, vui lòng chọn ghế khác"
                ));
    }

    // Các lỗi 4xx khác từ service nội bộ: giữ nguyên mã
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Map<String, String>> handleUpstreamClientError(
            HttpClientErrorException ex) {

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of(
                        "error", "UPSTREAM_ERROR",
                        "message", "Service nội bộ từ chối yêu cầu"
                ));
    }

    // Service nội bộ không phản hồi
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Map<String, String>> handleUpstreamUnavailable(
            RestClientException ex) {

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "error", "SERVICE_UNAVAILABLE",
                        "message", "Không kết nối được service nội bộ"
                ));
    }


    // Thiếu tham số hoặc sai kiểu dữ liệu trên query/path
    @ExceptionHandler({MissingServletRequestParameterException.class,
                    MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, String>> handleBadParameter(Exception ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "INVALID_PARAMETER",
                        "message", "Tham số request không hợp lệ"
                ));
    }


    // Showtime không tồn tại
    @ExceptionHandler(ShowtimeNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleShowtimeNotFound(
            ShowtimeNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "error", "SHOWTIME_NOT_FOUND",
                        "message", ex.getMessage()
                ));
    }


    // Service khác không hoạt động / timeout
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<Map<String, String>> handleServiceUnavailable(
            ServiceUnavailableException ex) {

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "error", "SERVICE_UNAVAILABLE",
                        "message", ex.getMessage()
                ));
    }


    // Ghế không hợp lệ
    @ExceptionHandler(InvalidSeatException.class)
    public ResponseEntity<Map<String, String>> handleInvalidSeat(
            InvalidSeatException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "INVALID_SEAT",
                        "message", ex.getMessage()
                ));
    }


    // Ghế đã được đặt
    @ExceptionHandler(SeatAlreadyBookedException.class)
    public ResponseEntity<Map<String, String>> handleSeatAlreadyBooked(
            SeatAlreadyBookedException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", "SEAT_ALREADY_BOOKED",
                        "message", ex.getMessage()
                ));
    }


    // Request không hợp lệ
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "INVALID_REQUEST",
                        "message", "Dữ liệu request không hợp lệ"
                ));
    }


    // JSON gửi lên bị sai
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleInvalidJson(
            HttpMessageNotReadableException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "INVALID_JSON",
                        "message", "Dữ liệu JSON không hợp lệ"
                ));
    }
}