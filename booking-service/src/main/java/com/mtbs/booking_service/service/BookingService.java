package com.mtbs.booking_service.service;

import com.mtbs.booking_service.domain.dto.request.CreateBookingRequest;
import com.mtbs.booking_service.domain.dto.response.BookingResponse;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);
}