/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.request;

import com.mtbs.movie_service.domain.entity.enums.ShowtimeStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
/**
 *
 * @author quanghieu
 */
public record ShowtimeRequest(
        @NotNull(message = "movieId không được để trống")
        Long movieId,

        @NotNull(message = "roomId không được để trống")
        Long roomId,

        @NotNull(message = "startTime không được để trống")
        OffsetDateTime startTime,

        @NotNull(message = "endTime không được để trống")
        OffsetDateTime endTime,

        @NotNull(message = "basePrice không được để trống")
        @DecimalMin(value = "0", inclusive = true, message = "basePrice phải >= 0")
        BigDecimal basePrice,

        ShowtimeStatus status
) {
}