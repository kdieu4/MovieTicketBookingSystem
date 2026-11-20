package com.mtbs.booking_service.client;

import com.mtbs.booking_service.domain.dto.response.UserResponse;
import com.mtbs.booking_service.exception.ServiceUnavailableException;
import com.mtbs.booking_service.exception.UserNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import org.springframework.web.client.RestClientException;

@Component
public class UserServiceClient {

    private final RestClient restClient;
    private final String internalApiKey;

    public UserServiceClient(
            @Qualifier("loadBalancedRestClientBuilder") RestClient.Builder restClientBuilder,
            @Value("${user-service.base-url}") String userServiceBaseUrl,
            @Value("${user-service.internal-api-key}") String internalApiKey) {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(3));

        this.restClient = restClientBuilder
                .baseUrl(userServiceBaseUrl)
                .requestFactory(factory)
                .build();
        this.internalApiKey = internalApiKey;
    }

    public UserResponse getUserById(Long userId) {

        try {

            return restClient.get()
                    .uri("/api/users/{userId}", userId)
                    .retrieve()
                    .body(UserResponse.class);

        } catch (HttpClientErrorException.NotFound ex) {

            throw new UserNotFoundException(
                    "Không tìm thấy User với ID: " + userId);

        } catch (ResourceAccessException ex) {

            throw new ServiceUnavailableException(
                    "User Service không phản hồi hoặc timeout");

        } catch (RestClientException | IllegalStateException ex) {

            throw new ServiceUnavailableException(
                    "Không thể kết nối đến User Service");
        }
    }

    public UserResponse getUserByAuthUserId(Long authUserId) {

        try {
            UserResponse user = restClient.get()
                    .uri("/api/users/internal/profiles/by-auth-user/{authUserId}", authUserId)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .retrieve()
                    .body(UserResponse.class);

            if (user == null || user.getId() == null) {
                throw new ServiceUnavailableException("User Service trả về hồ sơ không hợp lệ");
            }

            return user;

        } catch (HttpClientErrorException.NotFound ex) {
            throw new UserNotFoundException(
                    "Không tìm thấy hồ sơ với Auth User ID: " + authUserId);

        } catch (HttpClientErrorException.Unauthorized
                | HttpClientErrorException.Forbidden ex) {
            throw new ServiceUnavailableException(
                    "Booking Service không được phép truy cập User Service");

        } catch (ResourceAccessException ex) {
            throw new ServiceUnavailableException(
                    "User Service không phản hồi hoặc timeout");

        } catch (RestClientException | IllegalStateException ex) {
            throw new ServiceUnavailableException(
                    "Không thể truy xuất hồ sơ từ User Service");
        }
    }
}