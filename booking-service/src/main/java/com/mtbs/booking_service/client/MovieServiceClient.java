package com.mtbs.booking_service.client;

import com.mtbs.booking_service.domain.dto.response.SeatResponse;
import com.mtbs.booking_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.booking_service.exception.InvalidSeatException;
import com.mtbs.booking_service.exception.ServiceUnavailableException;
import com.mtbs.booking_service.exception.ShowtimeNotFoundException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Component
public class MovieServiceClient {

    private final RestClient restClient;

    public MovieServiceClient() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:8081")
                .build();
    }

    // Lấy thông tin Showtime
    public ShowtimeResponse getShowtimeById(Long showtimeId) {

        try {

            return restClient.get()
                    .uri("/api/showtimes/{showtimeId}", showtimeId)
                    .retrieve()
                    .body(ShowtimeResponse.class);

        } catch (HttpClientErrorException.NotFound ex) {

            throw new ShowtimeNotFoundException(
                    "Không tìm thấy Showtime với ID: " + showtimeId
            );

        } catch (ResourceAccessException ex) {

            throw new ServiceUnavailableException(
                    "Movie Service không phản hồi hoặc timeout"
            );

        } catch (RestClientException ex) {

            throw new ServiceUnavailableException(
                    "Không thể kết nối đến Movie Service"
            );
        }
    }

    // Lấy danh sách ghế của phòng
    public List<SeatResponse> getSeatsByRoomId(Long roomId) {

        try {

            return restClient.get()
                    .uri("/api/rooms/{roomId}/seats", roomId)
                    .retrieve()
                    .body(
                            new ParameterizedTypeReference<List<SeatResponse>>() {}
                    );

        } catch (HttpClientErrorException.NotFound ex) {

            throw new InvalidSeatException(
                    "Không tìm thấy phòng hoặc danh sách ghế"
            );

        } catch (ResourceAccessException ex) {

            throw new ServiceUnavailableException(
                    "Movie Service không phản hồi hoặc timeout"
            );

        } catch (RestClientException ex) {

            throw new ServiceUnavailableException(
                    "Không thể kết nối đến Movie Service"
            );
        }
    }
}