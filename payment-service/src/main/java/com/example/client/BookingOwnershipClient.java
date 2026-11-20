package com.example.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

/**
 * Kiem tra nguoi dang thanh toan co so huu booking hay khong.
 *
 * <p>Payment chi giu bookingId, con quyen so huu nam o booking-service. Goi lai
 * bang chinh token cua nguoi dung de booking-service tu quyet dinh, khong can
 * them quy tac trung lap o day.
 */
@Component
public class BookingOwnershipClient {

    private final RestClient restClient;

    public BookingOwnershipClient(
            RestClient.Builder restClientBuilder,
            @Value("${booking-service.base-url}") String bookingServiceBaseUrl) {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(3));

        this.restClient = restClientBuilder
                .baseUrl(bookingServiceBaseUrl)
                .requestFactory(factory)
                .build();
    }

    public void assertOwned(Long bookingId, String authorization) {

        try {
            restClient.get()
                    .uri("/api/bookings/{id}", bookingId)
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .toBodilessEntity();

        } catch (HttpClientErrorException.Unauthorized
                | HttpClientErrorException.Forbidden ex) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Khong co quyen thanh toan booking nay");

        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Khong tim thay booking");

        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Khong kiem tra duoc quyen so huu booking");
        }
    }
}
