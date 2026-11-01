package com.mtbs.auth_service.domain.dto.response;

public record TokenResponse(
        // Truy cap vao he thong
        String accessToken,

        // De lam moi accessToken, de nguoi dung ko can login
        String refreshToken,

        // Id nguoi dung
        Long userId
) {
    public static TokenResponse from(String accessToken, String refreshToken, Long userId) {
        return new TokenResponse(accessToken, refreshToken, userId);
    }
}
