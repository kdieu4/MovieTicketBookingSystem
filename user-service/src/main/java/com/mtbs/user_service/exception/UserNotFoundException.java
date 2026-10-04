package com.mtbs.user_service.exception;

/**
 * Nem ra khi khong tim thay user theo ID.
 * GlobalExceptionHandler se chuyen exception nay thanh HTTP 404 Not Found.
 */
public class UserNotFoundException extends RuntimeException {

    private final Long userId;

    public UserNotFoundException(Long userId) {
        super("Khong tim thay user voi id = " + userId);
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}