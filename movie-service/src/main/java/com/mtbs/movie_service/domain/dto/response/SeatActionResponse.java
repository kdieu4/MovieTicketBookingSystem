/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
/**
 *
 * @author quanghieu
 */
public record SeatActionResponse(
        List<Long> seatIds,
        OffsetDateTime holdUntil
) {
}