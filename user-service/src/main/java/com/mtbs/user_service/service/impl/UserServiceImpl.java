package com.mtbs.user_service.service.impl;

import com.mtbs.user_service.domain.dto.request.CreateUserProfileRequest;
import com.mtbs.user_service.domain.dto.request.UserRequest;
import com.mtbs.user_service.domain.dto.response.PageResponse;
import com.mtbs.user_service.domain.dto.response.UserResponse;
import com.mtbs.user_service.domain.entity.User;
import com.mtbs.user_service.exception.DuplicateUserDataException;
import com.mtbs.user_service.exception.UserNotFoundException;
import com.mtbs.user_service.repository.UserRepository;
import com.mtbs.user_service.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        return UserResponse.from(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(Pageable pageable) {
        Pageable effective = pageable.getSort().isSorted()
                ? pageable
                : PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), DEFAULT_SORT);

        return PageResponse.from(userRepository.findAll(effective), UserResponse::from);
    }

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

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponse createUserProfile(CreateUserProfileRequest request) {

        Long authUserId = request.authUserId();
        String fullName = request.fullName().trim();
        String email = request.email().trim();
        String phoneNumber = request.phoneNumber().trim();

        // 1. Kiểm tra authUserId đã tồn tại chưa
        var existingUser = userRepository.findByAuthUserId(authUserId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // Không cho phép cùng authUserId liên kết với dữ liệu khác
            if (!user.getEmail().equalsIgnoreCase(email)
                    || !user.getFullName().equals(fullName)
                    || !user.getPhoneNumber().equals(phoneNumber)) {

                throw new DuplicateUserDataException(
                        "authUserId",
                        authUserId.toString());
            }

            // Request trùng hợp lệ: trả về hồ sơ cũ
            return UserResponse.from(user);
        }

        // 2. Kiểm tra email
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateUserDataException("Email", email);
        }

        // 3. Kiểm tra số điện thoại
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicateUserDataException(
                    "So dien thoai",
                    phoneNumber);
        }

        // 4. Tạo hồ sơ mới
        User user = User.builder()
                .authUserId(authUserId)
                .fullName(fullName)
                .email(email)
                .phoneNumber(phoneNumber)
                .build();

        // 5. Lưu vào database
        try {
            User savedUser = userRepository.saveAndFlush(user);

            return UserResponse.from(savedUser);

        } catch (DataIntegrityViolationException ex) {
            // Xử lý trường hợp hai request đồng thời tạo dữ liệu trùng
            throw new DuplicateUserDataException(
                    "User profile",
                    authUserId.toString());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByAuthUserId(Long authUserId) {

        User user = userRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new UserNotFoundException(authUserId));

        return UserResponse.from(user);
    }
}