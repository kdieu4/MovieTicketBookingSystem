package com.mtbs.user_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Chuyen exception thanh HTTP response dang JSON.
 * Khong tach file ErrorResponse rieng vi pham vi tuan nay chi can cau truc
 * JSON don gian.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** User khong ton tai -> 404 Not Found. */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(errorBody(HttpStatus.NOT_FOUND, ex.getMessage()));
    }

    /**
     * ID khong phai so -> 400 Bad Request.
     * Spring nem MethodArgumentTypeMismatchException khi ep "abc" sang Long
     * (khong phai NumberFormatException nen bat class do se khong duoc).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleNumberFormat(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(errorBody(HttpStatus.BAD_REQUEST, "ID khong hop le"));
    }

    /** Loi chung -> 500 Internal Server Error. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody(HttpStatus.INTERNAL_SERVER_ERROR, "Da co loi xay ra tren may chu"));
    }

    /** Cau truc JSON loi tra ve. */
    private Map<String, Object> errorBody(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());
        return body;
    }
}