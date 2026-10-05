package com.mtbs.booking_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
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