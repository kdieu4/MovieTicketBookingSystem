package com.mtbs.auth_service.service;

import com.mtbs.auth_service.domain.dto.response.UserResponse;
import com.mtbs.auth_service.domain.entity.User;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService {
    UserDetailsService userDetailsService();

    UserResponse findUserById(Long userId);

    User getByEmail(String email);

    Long saveUser(User user);
}
