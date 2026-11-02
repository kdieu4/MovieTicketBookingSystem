package com.mtbs.auth_service.controller;

import com.mtbs.auth_service.domain.dto.request.ChangePasswordRequest;
import com.mtbs.auth_service.domain.dto.request.LoginRequest;
import com.mtbs.auth_service.domain.dto.request.RegisterRequest;
import com.mtbs.auth_service.domain.dto.response.ResponseData;
import com.mtbs.auth_service.domain.dto.response.ResponseError;
import com.mtbs.auth_service.domain.dto.response.ResponseSuccess;
import com.mtbs.auth_service.domain.dto.response.TokenResponse;
import com.mtbs.auth_service.service.AuthenticationService;
import com.mtbs.auth_service.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.http.HttpHeaders.REFERER;

@RequestMapping("/auth")
@RestController
@Validated
@Slf4j
@Tag(name = "Authentication Controller")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("register")
    @Operation(summary = "Đăng ký", description = "API này cho phép khách hàng đăng ký tài khoản")
    public ResponseData<Long> register(@RequestBody @Validated RegisterRequest request) {
        try {
            authenticationService.register(request);
            return new ResponseData<>(HttpStatus.CREATED.value(), "Register successfully");
        } catch (Exception e) {
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Save fail");
        }
    }

    @PostMapping("/login")
    public ResponseData<TokenResponse> login(@RequestBody @Validated LoginRequest request) {
        TokenResponse response = authenticationService.login(request);
        return new ResponseData<>(HttpStatus.OK.value(), "Login successfully", response);
    }

    @PostMapping("/refresh-token")
    public ResponseData<TokenResponse> refreshToken(HttpServletRequest request) {
        TokenResponse response = authenticationService.refreshToken(request);
        return new ResponseData<>(HttpStatus.OK.value(), "Refresh token successfully", response);
    }

    @PostMapping("/logout")
    public ResponseData<String> logout(HttpServletRequest request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Logout successfully", authenticationService.logout(request));
    }

    @PostMapping("/forgot-password")
    public ResponseData<String> forgotPassword(@RequestBody @Validated String email) {
        return new ResponseData<>(HttpStatus.OK.value(), "Send email successfully", authenticationService.forgotPassword(email));
    }

    @PostMapping("/confirm-reset")
    public ResponseData<String> resetPassword(@RequestBody String secretKey) {
        return new ResponseData<>(HttpStatus.OK.value(), "Send reset token successfully", authenticationService.resetPassword(secretKey));
    }

    @PostMapping("/change-password")
    public ResponseData<String> changePassword(@RequestBody ChangePasswordRequest request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Change password successfully", authenticationService.changePassword(request));
    }
}
