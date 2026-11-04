package com.mtbs.auth_service.domain.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotBlank(message = "Full name must not blank")
        String fullName,
        @Email(message = "Email invalid format")
        String email,
//        @PhoneNumber(message = "Phone number invalid format")
        @Pattern(regexp = "^\\d{10}", message = "Phone number invalid format")
        String phoneNumber,
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$", message = "Password invalid format")
        String password,
        @NotBlank(message = "Confirm password must not blank")
        String confirmPassword
) {

}
