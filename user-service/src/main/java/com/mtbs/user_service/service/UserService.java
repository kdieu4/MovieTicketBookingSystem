package com.mtbs.user_service.service;

import com.mtbs.user_service.domain.dto.request.UserRequest;
import com.mtbs.user_service.domain.dto.response.PageResponse;
import com.mtbs.user_service.domain.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/** Interface (contract) cho User Service. */
public interface UserService {

    /** Sap xep mac dinh khi client khong truyen {@code ?sort=}. */
    Sort DEFAULT_SORT = Sort.by(Sort.Direction.ASC, "id");

    /**
     * Tim user theo ID.
     *
     * @param id ID cua user can tim
     * @return thong tin user
     * @throws com.mtbs.user_service.exception.UserNotFoundException
     *         neu khong tim thay user tuong ung voi id
     */
    UserResponse getUserById(Long id);

    /**
     * Lay danh sach user co phan trang.
     *
     * @param pageable thong tin trang va sap xep; luon duoc gan sort mac dinh
     *                theo {@code Sort.Direction.ASC} neu client khong truyen.
     * @return mot trang du lieu user
     */
    PageResponse<UserResponse> getUsers(Pageable pageable);

    /**
     * Cap nhat thong tin user theo ID.
     * <p>
     * PUT nghia la thay the toan bo, nen tat ca truong trong {@link UserRequest}
     * deu bat buoc va duoc ghi de - thua duoc gi se mat.
     *
     * @param id      ID cua user can cap nhat
     * @param request du lieu moi
     * @return thong tin user sau khi cap nhat
     * @throws com.mtbs.user_service.exception.UserNotFoundException
     *         neu khong tim thay user tuong ung voi id
     * @throws com.mtbs.user_service.exception.DuplicateUserDataException
     *         neu email hoac so dien thoai da thuoc ve user khac
     */
    UserResponse updateUser(Long id, UserRequest request);

    /**
     * Xoa user theo ID.
     *
     * @param id ID cua user can xoa
     * @throws com.mtbs.user_service.exception.UserNotFoundException
     *         neu khong tim thay user tuong ung voi id
     */
    void deleteUser(Long id);
}
