/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.response;

import com.mtbs.movie_service.domain.entity.enums.ShowtimeStatus;
 
import java.math.BigDecimal;
import java.time.OffsetDateTime;
/**
 *
 * @author quanghieu
 */
public record ShowtimeResponse(
        Long showtimeId,
        Long movieId,
        Long roomId,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        BigDecimal basePrice,
        ShowtimeStatus status
) {

}