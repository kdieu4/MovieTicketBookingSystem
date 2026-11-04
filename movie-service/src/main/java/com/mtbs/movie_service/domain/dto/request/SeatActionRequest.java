/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
/**
 *
 * @author quanghieu
 */
public record SeatActionRequest(
        @NotBlank(message = "sessionId không được để trống")
        @Size(max = 100, message = "sessionId tối đa 100 ký tự")
        String sessionId,

        @NotEmpty(message = "seatIds không được để trống")
        @Size(max = 10, message = "Mỗi lần chỉ được thao tác tối đa 10 ghế")
        List<Long> seatIds
) {
}
