/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.exception;

import com.mtbs.movie_service.domain.dto.response.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
/**
 *
 * @author quanghieu
 */
@Order(org.springframework.core.Ordered.LOWEST_PRECEDENCE)
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ShowtimeNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleShowtimeNotFound(
            ShowtimeNotFoundException ex, HttpServletRequest request) {
        return ErrorResponseFactory.build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(SeatUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleSeatUnavailable(
            SeatUnavailableException ex, HttpServletRequest request) {
        return ErrorResponseFactory.build(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            IllegalArgumentException ex, HttpServletRequest request) {
        return ErrorResponseFactory.build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler({MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleBadParameter(
            Exception ex, HttpServletRequest request) {
        return ErrorResponseFactory.build(HttpStatus.BAD_REQUEST, "Tham số yêu cầu không hợp lệ", request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(
            ResponseStatusException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        return ErrorResponseFactory.build(status, message, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        return ErrorResponseFactory.build(
                HttpStatus.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra, vui lòng thử lại sau", request);
    }
}