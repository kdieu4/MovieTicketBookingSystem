package com.mtbs.auth_service.service;

import com.mtbs.auth_service.domain.dto.request.ChangePasswordRequest;
import com.mtbs.auth_service.domain.dto.request.LoginRequest;
import com.mtbs.auth_service.domain.dto.response.TokenResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthenticationService {
    TokenResponse login(LoginRequest request);

    TokenResponse refreshToken(HttpServletRequest request);

    String logout(HttpServletRequest request);

    String forgotPassword(String email);

    String resetPassword(String secretKey);

    String changePassword(ChangePasswordRequest request);
}
