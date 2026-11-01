package com.mtbs.auth_service.controller;

import com.mtbs.auth_service.domain.dto.request.ChangePasswordRequest;
import com.mtbs.auth_service.domain.dto.request.LoginRequest;
import com.mtbs.auth_service.domain.dto.response.TokenResponse;
import com.mtbs.auth_service.service.AuthenticationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Validated LoginRequest request) {
        TokenResponse response = authenticationService.login(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request) {
        TokenResponse response = authenticationService.refreshToken(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        return new ResponseEntity<>(authenticationService.logout(request), HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody @Validated String email) {
        return new ResponseEntity<>(authenticationService.forgotPassword(email), HttpStatus.OK);
    }

    @PostMapping("/confirm-reset")
    public ResponseEntity<String> resetPassword(@RequestBody String secretKey) {
        return new ResponseEntity<>(authenticationService.resetPassword(secretKey), HttpStatus.OK);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        return new ResponseEntity<>(authenticationService.changePassword(request), HttpStatus.OK);
    }
}
