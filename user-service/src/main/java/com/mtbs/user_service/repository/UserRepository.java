package com.mtbs.user_service.repository;

import com.mtbs.user_service.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Kiem tra email da ton tai o user KHAC id hien tai chua.
     * <p>
     * Phai loai trừ chính user dang cap nhat: khi sua user ma giữ nguyên
     * email, neu hoi co trung thi thong bao sai.
     *
     * @param email  email can kiem tra
     * @param userId id user dang cap nhat
     * @return true neu email da thuoc ve user khac
     */
    boolean existsByEmailAndIdNot(String email, Long userId);

    /**
     * Kiem tra so dien thoai da ton tai o user KHAC id hien tai chua.
     *
     * @param phoneNumber so dien thoai can kiem tra
     * @param userId      id user dang cap nhat
     * @return true neu so dien thoai da thuoc ve user khac
     */
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long userId);

    /**
     * Kiem tra email co ton tai hay khong.
     *
     * @param email email can kiem tra
     * @return true neu email da ton tai
     */
    boolean existsByEmail(String email);

    /**
     * Kiem tra so dien thoai co ton tai hay khong.
     *
     * @param phoneNumber so dien thoai can kiem tra
     * @return true neu so dien thoai da ton tai
     */
    boolean existsByPhoneNumber(String phoneNumber);
}
