/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.request;

import com.mtbs.movie_service.domain.entity.enums.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 *
 * @author quanghieu
 */
public record RoomRequest(
        @NotNull(message = "cinemaId không được để trống")
        Long cinemaId,

        @NotBlank(message = "Tên phòng chiếu không được để trống")
        String name,

        @NotNull(message = "Tổng số ghế không được để trống")
        @Positive(message = "Tổng số ghế phải lớn hơn 0")
        Short totalSeats,

        @NotNull(message = "Loại phòng chiếu không được để trống")
        RoomType roomType
) {
}