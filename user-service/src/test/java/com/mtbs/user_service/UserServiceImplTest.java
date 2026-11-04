package com.mtbs.user_service;

import com.mtbs.user_service.domain.dto.request.UserRequest;
import com.mtbs.user_service.domain.dto.response.UserResponse;
import com.mtbs.user_service.domain.entity.User;
import com.mtbs.user_service.exception.DuplicateUserDataException;
import com.mtbs.user_service.exception.UserNotFoundException;
import com.mtbs.user_service.repository.UserRepository;
import com.mtbs.user_service.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Kiem thu tang nghiep vu - UserServiceImpl.
 * Chay tren MySQL that nen du lieu mau trong data.sql duoc dung de kiem thu.
 * {@code @Transactional} khoan moi test se rollback sau khi xong, nen cac
 * test update/delete khong lam bay du lieu mau cho may dev.
 */
@SpringBootTest
@Transactional
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

    // ---------------- updateUser ----------------

    @Test
    @DisplayName("updateUser - cap nhat thanh cong va ghi xuong DB")
    void updateUser_capNhatThanhCong() {
        UserResponse result = userService.updateUser(1L, UserRequest.builder()
                .fullName("Nguyen Van An Moi")
                .email("an.moi@mtbs.vn")
                .phoneNumber("0901007777")
                .build());

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getFullName()).isEqualTo("Nguyen Van An Moi");
        assertThat(result.getEmail()).isEqualTo("an.moi@mtbs.vn");
        assertThat(result.getPhoneNumber()).isEqualTo("0901007777");

        // Doc lai tu DB de chung minh da persist chu khong chi doi trong RAM
        User inDb = userRepository.findById(1L).orElseThrow();
        assertThat(inDb.getEmail()).isEqualTo("an.moi@mtbs.vn");
    }

    @Test
    @DisplayName("updateUser - tu cat khoang trang thua truoc khi luu")
    void updateUser_tuCatKhoangTrangThua() {
        UserResponse result = userService.updateUser(1L, UserRequest.builder()
                .fullName("  Nguyen Van An  ")
                .email("  an.nguyen@mtbs.vn  ")
                .phoneNumber("  0901000001  ")
                .build());

        assertThat(result.getFullName()).isEqualTo("Nguyen Van An");
        assertThat(result.getEmail()).isEqualTo("an.nguyen@mtbs.vn");
        assertThat(result.getPhoneNumber()).isEqualTo("0901000001");
    }

    @Test
    @DisplayName("updateUser - giu nguyen email cua chinh minh thi hop le")
    void updateUser_giuNguyenEmailChinhMinu() {
        // Bat buoc phai loai tru id dang sua, neu khong se bao trung nham.
        UserResponse result = userService.updateUser(1L, UserRequest.builder()
                .fullName("Nguyen Van An")
                .email("an.nguyen@mtbs.vn")
                .phoneNumber("0901000001")
                .build());

        assertThat(result.getEmail()).isEqualTo("an.nguyen@mtbs.vn");
    }

    @Test
    @DisplayName("updateUser - email dang thuoc user khac -> DuplicateUserDataException")
    void updateUser_emailTrung_nemException() {
        assertThatThrownBy(() -> userService.updateUser(2L, UserRequest.builder()
                .fullName("Tran Thi Bich")
                .email("an.nguyen@mtbs.vn")   // email cua user id 1
                .phoneNumber("0901000002")
                .build()))
                .isInstanceOf(DuplicateUserDataException.class)
                .hasMessageContaining("an.nguyen@mtbs.vn");
    }

    @Test
    @DisplayName("updateUser - sdt dang thuoc user khac -> DuplicateUserDataException")
    void updateUser_sdtTrung_nemException() {
        assertThatThrownBy(() -> userService.updateUser(2L, UserRequest.builder()
                .fullName("Tran Thi Bich")
                .email("bich.tran@mtbs.vn")
                .phoneNumber("0901000001")     // sdt cua user id 1
                .build()))
                .isInstanceOf(DuplicateUserDataException.class);
    }

    @Test
    @DisplayName("updateUser - user khong ton tai -> UserNotFoundException")
    void updateUser_userKhongTonTai_nemException() {
        assertThatThrownBy(() -> userService.updateUser(999999L, UserRequest.builder()
                .fullName("Ai Do")
                .email("aid@mtbs.vn")
                .phoneNumber("0912000000")
                .build()))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    @DisplayName("updateUser - email trung thi khong duoc ghi gi vao DB")
    void updateUser_emailTrung_khongGhiDuLieu() {
        assertThatThrownBy(() -> userService.updateUser(2L, UserRequest.builder()
                .fullName("Ten Bi Tu Thay Do")
                .email("an.nguyen@mtbs.vn")
                .phoneNumber("0901000002")
                .build()))
                .isInstanceOf(DuplicateUserDataException.class);

        // Ho ten phai giu nguyen gia tri cu, khong bi ghi de 1/2 cho du lenh that bai
        assertThat(userRepository.findById(2L).orElseThrow().getFullName())
                .isEqualTo("Tran Thi Bich");
    }

    // ---------------- deleteUser ----------------

    @Test
    @DisplayName("deleteUser - xoa thanh cong, khong con trong DB")
    void deleteUser_xoaThanhCong() {
        userService.deleteUser(1L);

        assertThat(userRepository.findById(1L)).isEmpty();
    }

    @Test
    @DisplayName("deleteUser - user khong ton tai -> UserNotFoundException")
    void deleteUser_userKhongTonTai_nemException() {
        assertThatThrownBy(() -> userService.deleteUser(999999L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    @DisplayName("deleteUser - xoa 2 lan, lan 2 nem exception")
    void deleteUser_xoaHaiLan_lanHaiNemException() {
        userService.deleteUser(1L);

        assertThatThrownBy(() -> userService.deleteUser(1L))
                .isInstanceOf(UserNotFoundException.class);
    }
}