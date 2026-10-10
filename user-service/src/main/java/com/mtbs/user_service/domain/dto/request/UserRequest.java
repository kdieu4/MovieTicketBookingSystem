package com.mtbs.user_service.domain.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Du lieu dau vao khi tao moi / cap nhat user.
 * <p>
 * Dùng cho PUT /api/users/{id}. Khong khai bao truong {@code id} vi id lay
 * tu duong dan, khong phai tu body.
 * <p>
 * PUT theo chuan HTTP nghia la THAY THE toan bo, nen ca 3 truong deu bat
 * buoc. Neu muon cap nhat mot phan thi dung PATCH, khong dung PUT.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Du lieu cap nhat nguoi dung")
public class UserRequest {

    @NotBlank(message = "Ho ten khong duoc de trong")
    @Size(max = 100, message = "Ho ten toi da 100 ky tu")
    @Schema(description = "Ho ten day du", example = "Nguyen Van An", maxLength = 100)
    private String fullName;

    @NotBlank(message = "Email khong duoc de trong")
    @Email(message = "Email khong hop le")
    @Size(max = 150, message = "Email toi da 150 ky tu")
    @Schema(description = "Email, duy nhất trong hệ thống", example = "an.nguyen@mtbs.vn")
    private String email;

    @NotBlank(message = "So dien thoai khong duoc de trong")
    @Pattern(regexp = "^0[0-9]{9}$", message = "So dien thoai phai co 10 chu so va bat dau bang 0")
    @Schema(description = "So dien thoai, duy nhất trong hệ thống", example = "0901000001")
    private String phoneNumber;
}