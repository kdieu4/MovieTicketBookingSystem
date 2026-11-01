package com.mtbs.auth_service.domain.dto.request;

public record ChangePasswordRequest(
        String secretKey,
        String password,
        String confirmPassword
) {
}
