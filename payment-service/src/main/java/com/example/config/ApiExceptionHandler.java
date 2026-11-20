package com.example.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Chuan hoa loi tra ve cho payment-service.
 *
 * <p>Mac dinh Spring Boot tra ve body co ca stack trace, lam lo thong tin noi
 * bo (ten class, duong dan file). Lop nay thay body do bang JSON gon, chi con
 * ma loi va thong bao, va doi cac loi tham so sai thanh 400.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler({MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    public ResponseEntity<Map<String, String>> handleBadParameter(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "INVALID_PARAMETER",
                        "message", "Tham so request khong hop le"));
    }

    /** Giu nguyen ma trang thai da dat trong service, bo stack trace. */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of(
                        "error", ex.getStatusCode().toString(),
                        "message", ex.getReason() == null ? "Yeu cau khong hop le" : ex.getReason()));
    }
}
