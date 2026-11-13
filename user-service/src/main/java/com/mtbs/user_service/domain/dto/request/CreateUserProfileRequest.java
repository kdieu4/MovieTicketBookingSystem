package com.mtbs.user_service.domain.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateUserProfileRequest(

        @NotNull @Positive Long authUserId,

        @NotBlank @Size(max = 100) String fullName,

        @NotBlank @Email @Size(max = 150) String email,

        @NotBlank @Size(max = 15) String phoneNumber

) {
}