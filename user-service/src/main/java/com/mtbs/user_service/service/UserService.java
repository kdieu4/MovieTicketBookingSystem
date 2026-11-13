package com.mtbs.user_service.service;

import com.mtbs.user_service.domain.dto.request.CreateUserProfileRequest;
import com.mtbs.user_service.domain.dto.request.UserRequest;
import com.mtbs.user_service.domain.dto.response.PageResponse;
import com.mtbs.user_service.domain.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/** Interface (contract) cho User Service. */
public interface UserService {

    Sort DEFAULT_SORT = Sort.by(Sort.Direction.ASC, "id");

    UserResponse getUserById(Long id);

    PageResponse<UserResponse> getUsers(Pageable pageable);

    UserResponse updateUser(Long id, UserRequest request);

    UserResponse createUserProfile(CreateUserProfileRequest request);

    void deleteUser(Long id);

    UserResponse getUserByAuthUserId(Long authUserId);
}
