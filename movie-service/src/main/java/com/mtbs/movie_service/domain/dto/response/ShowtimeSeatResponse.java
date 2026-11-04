/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mtbs.movie_service.domain.entity.enums.SeatType;
/**
 *
 * @author quanghieu
 */
public record ShowtimeSeatResponse(
        Long id,
        String row,
        Short number,
        SeatType type,
        @JsonProperty("isSold") boolean isSold,
        boolean heldByMe
) {
}