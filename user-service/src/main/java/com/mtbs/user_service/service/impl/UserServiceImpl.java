package com.mtbs.user_service.service.impl;

import com.mtbs.user_service.domain.dto.response.UserResponse;
import com.mtbs.user_service.domain.entity.User;
import com.mtbs.user_service.exception.UserNotFoundException;
import com.mtbs.user_service.repository.UserRepository;
import com.mtbs.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
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
}