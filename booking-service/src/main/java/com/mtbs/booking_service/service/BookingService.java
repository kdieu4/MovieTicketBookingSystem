package com.mtbs.booking_service.service;

import com.mtbs.booking_service.domain.dto.request.CreateBookingRequest;
import com.mtbs.booking_service.domain.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {

    // Tạo booking cho chính người đang đăng nhập (authUserId lấy từ JWT)
    BookingResponse createBooking(CreateBookingRequest request, Long authUserId);

    // Lấy danh sách booking: ADMIN xem tất cả, người dùng chỉ xem của mình
    List<BookingResponse> getAllBookings(Long authUserId, boolean admin);

    // Lấy danh sách booking của một người dùng (mới nhất trước)
    List<BookingResponse> getBookingsByUser(Long userId, Long authUserId, boolean admin);

    // Lấy booking theo ID
    BookingResponse getBookingById(Long id, Long authUserId, boolean admin);

    // Cập nhật booking
    BookingResponse updateBooking(
            Long id,
            CreateBookingRequest request,
            Long authUserId,
            boolean admin);

    // Xóa booking
    void deleteBooking(Long id, Long authUserId, boolean admin);
}
