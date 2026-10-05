package com.mtbs.booking_service.client;

import com.mtbs.booking_service.domain.dto.response.UserResponse;
import com.mtbs.booking_service.exception.ServiceUnavailableException;
import com.mtbs.booking_service.exception.UserNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class UserServiceClient {

    private final RestClient restClient;

    public UserServiceClient() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:8081")
                .build();
    }

    public UserResponse getUserById(Long userId) {

        try {

            return restClient.get()
                    .uri("/api/users/{userId}", userId)
                    .retrieve()
                    .body(UserResponse.class);

        } catch (HttpClientErrorException.NotFound ex) {

            throw new UserNotFoundException(
                    "Không tìm thấy User với ID: " + userId
            );

        } catch (ResourceAccessException ex) {

            throw new ServiceUnavailableException(
                    "User Service không phản hồi hoặc timeout"
            );

        } catch (RestClientException ex) {

            throw new ServiceUnavailableException(
                    "Không thể kết nối đến User Service"
            );
        }
    }
}