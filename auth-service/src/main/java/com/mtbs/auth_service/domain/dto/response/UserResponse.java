package com.mtbs.auth_service.domain.dto.response;

import com.mtbs.auth_service.domain.entity.User;

public record UserResponse(
        String fullname,
        String email,
        String phoneNumber
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getFullName(), user.getEmail(), user.getPhoneNumber());
    }
}
