package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.request.SeatClaimRequest;
import com.mtbs.movie_service.domain.dto.response.SeatClaimResponse;
import com.mtbs.movie_service.service.impl.ShowtimeServiceImpl;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/internal/showtimes")
public class InternalSeatClaimController {

    private final ShowtimeServiceImpl showtimeService;

    @PostMapping("/{showtimeId}/seat-claims")
    public ResponseEntity<SeatClaimResponse> claimSeats(
            @PathVariable Long showtimeId,
            @Valid @RequestBody SeatClaimRequest request) {
        return ResponseEntity.ok(
                showtimeService.claimSeatsForBooking(
                        showtimeId,
                        request));
    }

    @DeleteMapping("/{showtimeId}/seat-claims/{bookingId}")
    public ResponseEntity<Void> releaseClaim(
            @PathVariable Long showtimeId,
            @PathVariable Long bookingId,
            @RequestBody List<Long> seatIds) {
        showtimeService.releaseBookingClaim(
                showtimeId,
                bookingId,
                seatIds);

        return ResponseEntity.noContent().build();
    }
}