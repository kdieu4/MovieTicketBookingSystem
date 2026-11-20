
package com.mtbs.booking_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.mtbs.booking_service.domain.dto.request.CreateBookingRequest;
import com.mtbs.booking_service.domain.dto.response.BookingResponse;
import com.mtbs.booking_service.service.BookingService;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST: Tạo booking
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        BookingResponse response =
                bookingService.createBooking(request, authUserId(jwt));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET: Lấy danh sách booking
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                bookingService.getAllBookings(authUserId(jwt), isAdmin(jwt))
        );
    }

    // GET: Lấy booking của một người dùng
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                bookingService.getBookingsByUser(userId, authUserId(jwt), isAdmin(jwt))
        );
    }

    // GET: Lấy booking theo ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                bookingService.getBookingById(id, authUserId(jwt), isAdmin(jwt))
        );
    }

    // PUT: Cập nhật booking
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                bookingService.updateBooking(id, request, authUserId(jwt), isAdmin(jwt))
        );
    }

    // DELETE: Xóa booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        bookingService.deleteBooking(id, authUserId(jwt), isAdmin(jwt));

        return ResponseEntity.noContent().build();
    }

    /** Id tai khoan auth do auth-service dat trong access token. */
    private static Long authUserId(Jwt jwt) {
        Object claim = jwt.getClaim("userId");
        if (claim instanceof Number number) {
            return number.longValue();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Token không chứa thông tin người dùng");
    }

    private static boolean isAdmin(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        return roles != null && roles.stream()
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ADMIN"));
    }
}
