package com.example.exception;

import com.example.base.ApiResponse;
import com.example.constant.ErrorMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handlePaymentNotFound(PaymentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(ErrorMessage.NOT_FOUND, ErrorMessage.NOT_FOUND_MESSAGE));
    }

    @ExceptionHandler(PaymentProcessingException.class)
    public ResponseEntity<ApiResponse<Object>> handlePaymentProcessing(PaymentProcessingException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(ErrorMessage.INTERNAL_ERROR, ErrorMessage.INTERNAL_ERROR_MESSAGE));
    }
}
