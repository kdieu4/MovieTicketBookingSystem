package com.mtbs.auth_service.service.impl;

import com.mtbs.auth_service.domain.dto.response.UserResponse;
import com.mtbs.auth_service.domain.entity.User;
import com.mtbs.auth_service.repository.UserRepository;
import com.mtbs.auth_service.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {
    UserRepository userRepository;

    @Override
    public UserDetailsService userDetailsService() {
        return email -> userRepository.findByEmail(email).orElseThrow(
                () -> new UsernameNotFoundException("Email not found!")
        );
    }

    @Override
    public UserResponse findUserById(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new UsernameNotFoundException("Khong tim thay nguoi dung")
        );

        return UserResponse.from(user);
    }

    @Override
    public User getByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new UsernameNotFoundException("Khong tim thay nguoi dung")
        );
        return user;
    }

    @Override
    public Long saveUser(User user) {
        userRepository.save(user);
        return user.getUserId();
    }
}
