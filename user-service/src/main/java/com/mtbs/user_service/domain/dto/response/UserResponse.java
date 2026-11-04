package com.mtbs.user_service.domain.dto.response;

import com.mtbs.user_service.domain.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Du lieu User tra ra ngoai.
 * Tach rieng khoi entity de khi them cac truong nho mat (mat khau, ...)
 * sau nay, do khong lo ra API.
 */
@Getter
@Builder
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDateTime createdAt;

    /** Thoi diem lan cuoi cap nhat. Huu ich khi client can theo doi thay doi. */
    private LocalDateTime updatedAt;

    /** Chuyen tu entity sang response. */
    public static UserResponse from(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}