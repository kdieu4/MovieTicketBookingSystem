package com.mtbs.user_service.controller;

import com.mtbs.user_service.domain.dto.request.CreateUserProfileRequest;
import com.mtbs.user_service.domain.dto.request.UserRequest;
import com.mtbs.user_service.domain.dto.response.PageResponse;
import com.mtbs.user_service.domain.dto.response.UserResponse;
import com.mtbs.user_service.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "Quan ly thong tin nguoi dung")
public class UserController {

        @Value("${app.internal-api-key}")
        private String internalApiKey;
        private final UserService userService;

        @Operation(summary = "Lay thong tin nguoi dung theo ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Tim thay nguoi dung", content = @Content(schema = @Schema(implementation = UserResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Khong tim thay nguoi dung")
        })
        @GetMapping("/{id}")
        public ResponseEntity<UserResponse> getUserById(
                        @Parameter(description = "ID cua nguoi dung", example = "1") @PathVariable Long id) {
                return ResponseEntity.ok(userService.getUserById(id));
        }

        @Operation(summary = "Lay danh sach nguoi dung co phan trang")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Tra ve mot trang du lieu", content = @Content(schema = @Schema(implementation = PageResponse.class)))
        })
        @GetMapping
        public ResponseEntity<PageResponse<UserResponse>> getUsers(
                        @ParameterObject @PageableDefault(size = 10, sort = "id") Pageable pageable) {
                return ResponseEntity.ok(userService.getUsers(pageable));
        }

        @Operation(summary = "Cap nhat thong tin nguoi dung theo ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Cap nhat thanh cong", content = @Content(schema = @Schema(implementation = UserResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Du lieu trong body khong hop le"),
                        @ApiResponse(responseCode = "404", description = "Khong tim thay nguoi dung"),
                        @ApiResponse(responseCode = "409", description = "Email hoac so dien thoai da ton tai")
        })
        @PutMapping("/{id}")
        public ResponseEntity<UserResponse> updateUser(
                        @Parameter(description = "ID cua nguoi dung", example = "1") @PathVariable Long id,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Day du thong tin nguoi dung moi", required = true, content = @Content(schema = @Schema(implementation = UserRequest.class))) @Valid @RequestBody UserRequest request) {
                return ResponseEntity.ok(userService.updateUser(id, request));
        }

        @Operation(summary = "Xoa nguoi dung theo ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Xoa thanh cong"),
                        @ApiResponse(responseCode = "404", description = "Khong tim thay nguoi dung")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteUser(
                        @Parameter(description = "ID cua nguoi dung", example = "1") @PathVariable Long id) {
                userService.deleteUser(id);
                return ResponseEntity.noContent().build();
        }

        @PostMapping("/internal/profiles")
        public ResponseEntity<UserResponse> createUserProfile(
                        @RequestHeader(value = "X-Internal-Api-Key", required = false) String providedKey,

                        @Valid @RequestBody CreateUserProfileRequest request) {

                validateInternalApiKey(providedKey);

                UserResponse response = userService.createUserProfile(request);

                return ResponseEntity.ok(response);
        }

        @Operation(summary = "Lay ho so nguoi dung theo Auth User ID")
        // @ApiResponses({
        // @ApiResponse(responseCode = "200", description = "Tim thay ho so"),
        // @ApiResponse(responseCode = "401", description = "API Key khong hop le"),
        // @ApiResponse(responseCode = "404", description = "Khong tim thay ho so")
        // })
        @GetMapping("/internal/profiles/by-auth-user/{authUserId}")
        public ResponseEntity<UserResponse> getUserByAuthUserId(
                        @RequestHeader(value = "X-Internal-Api-Key", required = false) String providedKey,
                        @PathVariable Long authUserId) {

                validateInternalApiKey(providedKey);

                UserResponse response = userService.getUserByAuthUserId(authUserId);

                return ResponseEntity.ok(response);
        }

        private void validateInternalApiKey(String providedKey) {

                if (providedKey == null || !MessageDigest.isEqual(
                                internalApiKey.getBytes(StandardCharsets.UTF_8),
                                providedKey.getBytes(StandardCharsets.UTF_8))) {

                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Invalid internal credentials");
                }
        }
}