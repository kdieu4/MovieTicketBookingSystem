package com.mtbs.user_service;

import com.mtbs.user_service.domain.dto.response.UserResponse;
import com.mtbs.user_service.domain.entity.User;
import com.mtbs.user_service.exception.UserNotFoundException;
import com.mtbs.user_service.repository.UserRepository;
import com.mtbs.user_service.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Kiem thu tang nghiep vu - UserServiceImpl.
 * Chay tren MySQL that nen du lieu mau trong data.sql duoc dung de kiem thu.
 */
@SpringBootTest
class UserServiceImplTest {

    @Autowired UserService userService;
    @Autowired UserRepository userRepository;

    private static final java.util.concurrent.atomic.AtomicInteger SEQ =
            new java.util.concurrent.atomic.AtomicInteger();

    // ---------------- User TON TAI ----------------

    @Test
    @DisplayName("User ton tai -> tra ve dung thong tin")
    void getUserById_userTonTai_traVeThongTin() {
        UserResponse result = userService.getUserById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getFullName()).isEqualTo("Nguyen Van An");
        assertThat(result.getEmail()).isEqualTo("an.nguyen@mtbs.vn");
        assertThat(result.getPhoneNumber()).isEqualTo("0901000001");
        assertThat(result.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Tu 5 user trong du lieu mau deu tra ve dung")
    void getUserById_tatCaUserTrongDuLieuMau() {
        assertThat(userService.getUserById(1L).getEmail()).isEqualTo("an.nguyen@mtbs.vn");
        assertThat(userService.getUserById(2L).getEmail()).isEqualTo("bich.tran@mtbs.vn");
        assertThat(userService.getUserById(3L).getEmail()).isEqualTo("chung.le@mtbs.vn");
        assertThat(userService.getUserById(4L).getEmail()).isEqualTo("dung.pham@mtbs.vn");
        assertThat(userService.getUserById(5L).getEmail()).isEqualTo("em.vo@mtbs.vn");
    }

    @Test
    @DisplayName("User vua duoc them vao DB -> cung tra ve dung")
    void getUserById_userMoiThem() {
        // Sinh email/sdt duy nhat: test phai chay lai nhieu lan tren MySQL that
        // ma van xanh (truong email/phone la UNIQUE nen du lieu co dinh se trung).
        String tag = System.currentTimeMillis() + "-" + SEQ.incrementAndGet();
        String email = "moi." + tag + "@mtbs.vn";
        String phone = "09" + (int) (Math.random() * 89999999 + 10000000);

        User user = userRepository.save(User.builder()
                .fullName("Nguoi Dung Moi")
                .email(email)
                .phoneNumber(phone)
                .build());

        UserResponse result = userService.getUserById(user.getId());

        assertThat(result.getFullName()).isEqualTo("Nguoi Dung Moi");
        assertThat(result.getEmail()).isEqualTo(email);
        assertThat(result.getPhoneNumber()).isEqualTo(phone);
    }

    // ---------------- User KHONG TON TAI ----------------

    @Test
    @DisplayName("User khong ton tai -> nem UserNotFoundException")
    void getUserById_userKhongTonTai_nemException() {
        assertThatThrownBy(() -> userService.getUserById(999999L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("999999");
    }

    @Test
    @DisplayName("UserNotFoundException luu lai id da truy van")
    void getUserById_exceptionChuaId() {
        assertThatThrownBy(() -> userService.getUserById(123L))
                .isInstanceOfSatisfying(UserNotFoundException.class,
                        ex -> assertThat(ex.getUserId()).isEqualTo(123L));
    }

    @Test
    @DisplayName("ID am cung khong tim thay user")
    void getUserById_idAm_khongTimThay() {
        assertThatThrownBy(() -> userService.getUserById(-1L))
                .isInstanceOf(UserNotFoundException.class);
    }

    // ---------------- UserResponse ----------------

    @Test
    @DisplayName("UserResponse khong duoc dinh nghia truong password (an toan)")
    void userResponse_khongCoTruongPassword() {
        var fields = java.util.Arrays.stream(UserResponse.class.getDeclaredFields())
                .map(java.lang.reflect.Field::getName)
                .toList();

        assertThat(fields).doesNotContain("password");
    }
}