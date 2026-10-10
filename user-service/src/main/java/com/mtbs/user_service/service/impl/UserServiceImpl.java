package com.mtbs.user_service.service.impl;

import com.mtbs.user_service.domain.dto.request.UserRequest;
import com.mtbs.user_service.domain.dto.response.PageResponse;
import com.mtbs.user_service.domain.dto.response.UserResponse;
import com.mtbs.user_service.domain.entity.User;
import com.mtbs.user_service.exception.DuplicateUserDataException;
import com.mtbs.user_service.exception.UserNotFoundException;
import com.mtbs.user_service.repository.UserRepository;
import com.mtbs.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    /**
     * Tim user theo ID.
     * Khong tim thay -> nem UserNotFoundException,
     * GlobalExceptionHandler se chuyen thanh HTTP 404 Not Found.
     */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        return UserResponse.from(user);
    }

    /**
     * Lay danh sach user co phan trang.
     * <p>
     * Luon gan sort mac dinh (id asc) khi client khong truyen {@code ?sort=}.
     * Neu de trong, MySQL co the tra cac trang theo thu tu bat ky -> cung du
     * lieu nhung ban ghi co the bi trung hoac mat giua cac trang.
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(Pageable pageable) {
        Pageable effective = pageable.getSort().isSorted()
                ? pageable
                : PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), DEFAULT_SORT);

        return PageResponse.from(userRepository.findAll(effective), UserResponse::from);
    }

    /**
     * Cap nhat thong tin user theo ID.
     * <p>
     * Kiem tra trung email / so dien thoai TRUOC khi ghi. Neu khong kiem tra,
     * MySQL nem DataIntegrityViolationException - thong bao loi do kho doc, va
     * khi nhieu request chay song song van co kha nang ghi trung.
     * <p>
     * Cac truy van kiem tra loai trừ chinh user dang cap nhat, nen sua user
     * ma giu nguyên email/sdt vẫn hợp lệ.
     */
    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        String email = request.getEmail().trim();
        String phoneNumber = request.getPhoneNumber().trim();

        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new DuplicateUserDataException("Email", email);
        }
        if (userRepository.existsByPhoneNumberAndIdNot(phoneNumber, id)) {
            throw new DuplicateUserDataException("So dien thoai", phoneNumber);
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);

        // saveAndFlush chu khong phai save: @UpdateTimestamp chi duoc gan khi
        // Hibernate ghi xuong DB. Dung save thi response tra updatedAt cu,
        // khac voi gia tri that trong DB.
        return UserResponse.from(userRepository.saveAndFlush(user));
    }

    /**
     * Xoa user theo ID.
     * <p>
     * Dung findById truoc khi xoa de nem UserNotFoundException (404).
     * Neu goi deleteById luon, JPA khong bao loi - client nhan 204 du user
     * khong ton tai, khong phan biet duoc "da xoa" voi "chua co gi".
     */
    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        userRepository.delete(user);
    }
}
