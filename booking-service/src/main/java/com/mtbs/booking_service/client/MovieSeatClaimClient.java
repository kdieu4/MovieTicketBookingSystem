package com.mtbs.booking_service.client;

import com.mtbs.booking_service.exception.ServiceUnavailableException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;

@Component
public class MovieSeatClaimClient {

    private final RestClient restClient;

    public MovieSeatClaimClient(
            @Qualifier("loadBalancedRestClientBuilder") RestClient.Builder restClientBuilder,
            @Value("${movie-service.base-url}") String baseUrl,
            @Value("${movie-service.internal-api-key}") String internalApiKey) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(3));

        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultHeader("X-Internal-Api-Key", internalApiKey)
                .build();
    }

    public record ClaimRequest(Long bookingId, String sessionId, List<Long> seatIds) {}

    public record ClaimResult(List<Long> seatIds, OffsetDateTime holdUntil, BigDecimal amount) {}

    public ClaimResult claimSeats(
            Long showtimeId,
            Long bookingId,
            String sessionId,
            List<Long> seatIds) {
        try {
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
        } catch (IllegalStateException ex) {
            throw new ServiceUnavailableException(
                    "Movie Service không còn instance khả dụng");
        }
    }

    public void releaseClaim(
            Long showtimeId,
            Long bookingId,
            List<Long> seatIds) {
        try {
            restClient.method(
                    org.springframework.http.HttpMethod.DELETE)
                    .uri(
                            "/api/internal/showtimes/{id}/seat-claims/{bookingId}",
                            showtimeId,
                            bookingId)
                    .body(seatIds)
                    .retrieve()
                    .toBodilessEntity();
        } catch (IllegalStateException ex) {
            throw new ServiceUnavailableException(
                    "Movie Service không còn instance khả dụng");
        }
    }
}