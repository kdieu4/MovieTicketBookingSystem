/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.request;

import com.mtbs.movie_service.domain.entity.enums.SeatType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
/**
 *
 * @author quanghieu
 */
public record SeatRequest(
        @NotNull(message = "roomId không được để trống")
        Long roomId,

        @NotBlank(message = "seatRow không được để trống")
        String seatRow,

        @NotNull(message = "seatNumber không được để trống")
        @Positive(message = "seatNumber phải lớn hơn 0")
        Short seatNumber,

        SeatType seatType
) {
}