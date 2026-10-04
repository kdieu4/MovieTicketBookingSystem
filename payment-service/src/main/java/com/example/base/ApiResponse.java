package com.example.base;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

public record ApiResponse<T>(
        Boolean success,
        RestData<T> data,
        Instant timestamp
) {
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, RestData.success(message, data), Instant.now());
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(HttpStatus status, String message, T data) {
        ApiResponse<T> response = new ApiResponse<>(true, RestData.success(message, data), Instant.now());
        return new ResponseEntity<>(response, status);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, RestData.error(code, message), Instant.now());
    }

    public static <T> ApiResponse<T> error(String code, String message, Object details) {
        return new ApiResponse<>(false, RestData.error(code, message, details), Instant.now());
    }
}
