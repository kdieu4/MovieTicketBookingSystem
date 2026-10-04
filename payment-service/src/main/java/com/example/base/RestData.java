package com.example.base;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RestData<T> {
    private String code;
    private String message;
    private T data;
    private Object details;

    public static <T> RestData<T> success(String message, T data) {
        RestData<T> response = new RestData<>();
        response.setMessage(message);
        response.setData(data);
        return response;
    }

    public static <T> RestData<T> error(String code, String message) {
        RestData<T> response = new RestData<>();
        response.setCode(code);
        response.setMessage(message);
        return response;
    }

    public static <T> RestData<T> error(String code, String message, Object details) {
        RestData<T> response = new RestData<>();
        response.setCode(code);
        response.setMessage(message);
        response.setDetails(details);
        return response;
    }
}
