package com.mtbs.auth_service.controller;

import com.mtbs.auth_service.domain.dto.response.UserResponse;
import com.mtbs.auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserDetail(@PathVariable Long userId) {
        UserResponse response = userService.findUserById(userId);
        return ResponseEntity.ok(response);
    }
}
