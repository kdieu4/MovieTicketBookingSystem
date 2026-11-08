
package com.mtbs.booking_service.service;

import com.mtbs.booking_service.domain.dto.request.CreateBookingRequest;
import com.mtbs.booking_service.domain.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {

    // Tạo booking
    BookingResponse createBooking(CreateBookingRequest request);

    // Lấy danh sách booking
    List<BookingResponse> getAllBookings();

    // Lấy booking theo ID
    BookingResponse getBookingById(Long id);

    // Cập nhật booking
    BookingResponse updateBooking(
            Long id,
            CreateBookingRequest request
    );

    // Xóa booking
    void deleteBooking(Long id);
}
