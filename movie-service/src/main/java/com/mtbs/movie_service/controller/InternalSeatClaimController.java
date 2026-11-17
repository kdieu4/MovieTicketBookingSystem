package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.request.SeatClaimRequest;
import com.mtbs.movie_service.domain.dto.response.SeatClaimResponse;
import com.mtbs.movie_service.service.impl.ShowtimeServiceImpl;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/**
 * API noi bo chi danh cho service khac (booking-service), khong danh cho client.
 * Gateway chan path /api/internal/, tai day kiem tra them service key de chan
 * truong hop goi thang vao cong 8083.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/internal/showtimes")
public class InternalSeatClaimController {

    private final ShowtimeServiceImpl showtimeService;

    @Value("${app.internal-api-key}")
    private String internalApiKey;

    @PostMapping("/{showtimeId}/seat-claims")
    public ResponseEntity<SeatClaimResponse> claimSeats(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String providedKey,
            @PathVariable Long showtimeId,
            @Valid @RequestBody SeatClaimRequest request) {
        validateInternalKey(providedKey);

        return ResponseEntity.ok(
                showtimeService.claimSeatsForBooking(
                        showtimeId,
                        request));
    }

    @DeleteMapping("/{showtimeId}/seat-claims/{bookingId}")
    public ResponseEntity<Void> releaseClaim(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String providedKey,
            @PathVariable Long showtimeId,
            @PathVariable Long bookingId,
            @RequestBody List<Long> seatIds) {
        validateInternalKey(providedKey);

        showtimeService.releaseBookingClaim(
                showtimeId,
                bookingId,
                seatIds);

        return ResponseEntity.noContent().build();
    }

    private void validateInternalKey(String providedKey) {
        if (providedKey == null || !MessageDigest.isEqual(
                internalApiKey.getBytes(StandardCharsets.UTF_8),
                providedKey.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid internal credentials");
        }
    }
}
