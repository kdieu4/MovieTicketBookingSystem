package com.mtbs.booking_service.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateBookingRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long showtimeId;

    @NotEmpty
    private List<@NotNull Long> seatIds;

    @NotBlank
    private String sessionId;

    @NotBlank
    private String requestId;
}