package com.mtbs.booking_service.client;

import com.mtbs.booking_service.domain.dto.response.SeatResponse;
import com.mtbs.booking_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.booking_service.exception.InvalidSeatException;
import com.mtbs.booking_service.exception.ServiceUnavailableException;
import com.mtbs.booking_service.exception.ShowtimeNotFoundException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import org.springframework.web.client.RestClientException;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;

@Component
public class MovieServiceClient {

    private final RestClient restClient;

    public MovieServiceClient(
            @Qualifier("loadBalancedRestClientBuilder") RestClient.Builder restClientBuilder,
            @Value("${movie-service.base-url}") String baseUrl) {
        // Timeout để không treo request khi movie-service chậm hoặc chết.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(3));

        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    // Lấy thông tin Showtime
    public ShowtimeResponse getShowtimeById(Long showtimeId) {
        try {
            return restClient.get()
                    .uri("/api/getShowtimeById?id={id}", showtimeId)
                    .retrieve()
                    .body(ShowtimeResponse.class);

        } catch (HttpClientErrorException.NotFound ex) {
            throw new ShowtimeNotFoundException(
                    "Không tìm thấy Showtime với ID: " + showtimeId);

        } catch (ResourceAccessException ex) {
            throw new ServiceUnavailableException(
                    "Movie Service không phản hồi hoặc timeout");

        } catch (RestClientException | IllegalStateException ex) {
            throw new ServiceUnavailableException(
                    "Không thể kết nối đến Movie Service: " + ex.getMessage());
        }
    }

    // Lấy danh sách ghế theo suất chiếu
    public List<SeatResponse> getSeatsByShowtime(Long showtimeId) {
        try {
            return restClient.get()
                    .uri("/api/getSeatsByShowtime?showtimeId={id}", showtimeId)
                    .retrieve()
                    .body(
                            new ParameterizedTypeReference<List<SeatResponse>>() {
                            });

        } catch (HttpClientErrorException.NotFound ex) {
            throw new InvalidSeatException(
                    "Không tìm thấy danh sách ghế của suất chiếu");

        } catch (ResourceAccessException ex) {
            throw new ServiceUnavailableException(
                    "Movie Service không phản hồi hoặc timeout");

        } catch (RestClientException | IllegalStateException ex) {
            throw new ServiceUnavailableException(
                    "Không thể kết nối đến Movie Service: " + ex.getMessage());
        }
    }
}