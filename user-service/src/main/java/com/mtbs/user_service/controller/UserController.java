package com.mtbs.user_service.controller;

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
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "Quan ly thong tin nguoi dung")
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/{id}
     * <p>
     * - User ton tai       -> 200 OK + JSON thong tin user
     * - User khong ton tai -> 404 Not Found (GlobalExceptionHandler xu ly)
     */
    @Operation(summary = "Lay thong tin nguoi dung theo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tim thay nguoi dung",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "404", description = "Khong tim thay nguoi dung")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @Parameter(description = "ID cua nguoi dung", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * GET /api/users?page=0&size=10&sort=id,asc
     * <p>
     * Lay danh sach nguoi dung co phan trang.
     * Vi du: {@code /api/users?page=0&size=2&sort=fullName,desc}
     * <p>
     * {@code sort} luon co gia tri mac dinh (id asc) neu khong truyen,
     * de cac trang khong bi trung hoac mat ban ghi.
     */
    @Operation(summary = "Lay danh sach nguoi dung co phan trang")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tra ve mot trang du lieu",
                    content = @Content(schema = @Schema(implementation = PageResponse.class)))
    })
    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> getUsers(
            @ParameterObject
            @PageableDefault(size = 10, sort = "id")
            Pageable pageable) {
        return ResponseEntity.ok(userService.getUsers(pageable));
    }

    /**
     * PUT /api/users/{id}
     * <p>
     * Cap nhat thong tin user. Theo chuan HTTP, PUT nghia la thay the toan bo
     * nen ca 3 truong deu bat buoc - truong nao bo trong se bi ghi de.
     *
     * - User ton tai           -> 200 OK + JSON user sau khi cap nhat
     * - User khong ton tai     -> 404 Not Found
     * - Du lieu sai dinh dang   -> 400 Bad Request (ten truong + ly do)
     * - Email/sdt bi trung     -> 409 Conflict
     */
    @Operation(summary = "Cap nhat thong tin nguoi dung theo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cap nhat thanh cong",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "400", description = "Du lieu trong body khong hop le"),
            @ApiResponse(responseCode = "404", description = "Khong tim thay nguoi dung"),
            @ApiResponse(responseCode = "409", description = "Email hoac so dien thoai da ton tai")
    })
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @Parameter(description = "ID cua nguoi dung", example = "1")
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Day du thong tin nguoi dung moi",
                    required = true,
                    content = @Content(schema = @Schema(implementation = UserRequest.class)))
            @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    /**
     * DELETE /api/users/{id}
     * <p>
     * - User ton tai       -> 204 No Content (khong co body)
     * - User khong ton tai -> 404 Not Found
     */
    @Operation(summary = "Xoa nguoi dung theo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xoa thanh cong"),
            @ApiResponse(responseCode = "404", description = "Khong tim thay nguoi dung")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID cua nguoi dung", example = "1")
            @PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}