package com.mtbs.auth_service.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

public class ResponseData<T> {
    private int status;
    private String message;
    @JsonInclude(JsonInclude.Include.NON_NULL) // khi data rong thi ko hien thi
    private T data;

    // PUT, DELETE, PATCH
    public ResponseData(int status, String message) {
        this.status = status;
        this.message = message;
    }

    // GET, POST
    public ResponseData(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }
}
