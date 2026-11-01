package com.mtbs.auth_service.domain.dto.request;

import com.mtbs.auth_service.util.Platform;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email must be not null")
        String email,

        @NotBlank(message = "Password must be not null")
        String password,

        // thiet bi truy cap vao du lieu
        // validate enum
        Platform platform,

        // Nhan notify tren dien thoai, luu vao db, gioi han thiet bi cho tai khoan
        String deviceToken,

        // Phien ban cho dien thoai, tim loi lien quan den tich hop
        String versionApp
) {
}