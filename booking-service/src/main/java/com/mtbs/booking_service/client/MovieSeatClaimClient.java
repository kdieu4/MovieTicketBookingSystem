package com.mtbs.booking_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Component
public class MovieSeatClaimClient {

    private final RestClient restClient;

    public MovieSeatClaimClient(
            @Value("${movie-service.base-url}") String baseUrl) {
        this.restClient = RestClient.create(baseUrl);
    }

    public record ClaimRequest(Long bookingId, String sessionId, List<Long> seatIds) {}

    public record ClaimResult(List<Long> seatIds, OffsetDateTime holdUntil, BigDecimal amount) {}

    public ClaimResult claimSeats(
            Long showtimeId,
            Long bookingId,
            String sessionId,
            List<Long> seatIds) {
        return restClient.post()
                .uri(
                        "/api/internal/showtimes/{id}/seat-claims",
                        showtimeId)
                .body(new ClaimRequest(
                        bookingId,
                        sessionId,
                        seatIds))
                .retrieve()
                .body(ClaimResult.class);
    }

    public void releaseClaim(
            Long showtimeId,
            Long bookingId,
            List<Long> seatIds) {
        restClient.method(
                org.springframework.http.HttpMethod.DELETE)
                .uri(
                        "/api/internal/showtimes/{id}/seat-claims/{bookingId}",
                        showtimeId,
                        bookingId)
                .body(seatIds)
                .retrieve()
                .toBodilessEntity();
    }
}