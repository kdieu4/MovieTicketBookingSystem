package com.mtbs.booking_service.exception;

public class ShowtimeNotFoundException extends RuntimeException {

    public ShowtimeNotFoundException(String message) {
        super(message);
    }
}