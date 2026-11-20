package com.mtbs.auth_service.domain.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotBlank(message = "Full name must not blank")
        String fullName,
        @NotBlank(message = "Email must not blank")
        @Email(message = "Email invalid format")
        String email,
//        @PhoneNumber(message = "Phone number invalid format")
        @NotBlank(message = "Phone number must not blank")
        @Pattern(regexp = "^\\d{10}", message = "Phone number invalid format")
        String phoneNumber,
        @NotBlank(message = "Password must not blank")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", message = "Password invalid format")
        String password,
        @NotBlank(message = "Confirm password must not blank")
        String confirmPassword
) {

}
