package com.mtbs.auth_service.exception;

public class DuplicateResouceException extends RuntimeException {
    public DuplicateResouceException(String message) {
        super(message);
    }

    public DuplicateResouceException(String message, Throwable cause) {
        super(message, cause);
    }
}
