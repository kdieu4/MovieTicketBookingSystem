package com.mtbs.user_service.service;

import com.mtbs.user_service.domain.dto.response.UserResponse;

/**
 * Interface (contract) cho User Service.
 *
 * Pham vi tuan nay: chi can tim user theo ID cho Booking Service kiem tra
 * nguoi dung truoc khi tao dat ve.
 */
public interface UserService {

    /**
     * Tim user theo ID.
     *
     * @param id ID cua user can tim
     * @return thong tin user
     * @throws com.mtbs.user_service.exception.UserNotFoundException
     *         neu khong tim thay user tuong ung voi id
     */
    UserResponse getUserById(Long id);
}