/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.exception;

import com.mtbs.movie_service.domain.dto.response.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
/**
 *
 * @author quanghieu
 */
@RestControllerAdvice
public class NotFoundExceptionHandler {

    @ExceptionHandler({
            MovieNotFoundException.class,
            ShowtimeNotFoundException.class,
            RoomNotFoundException.class
    })
    public ResponseEntity<ErrorResponse> handleNotFound(RuntimeException ex, HttpServletRequest request) {
        return ErrorResponseFactory.build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }
}