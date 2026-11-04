/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.response;

import com.mtbs.movie_service.domain.entity.enums.RoomType;

import java.time.OffsetDateTime;

/**
 *
 * @author quanghieu
 */
public record RoomResponse(
        Long roomId,
        Long cinemaId,
        String name,
        Short totalSeats,
        RoomType roomType,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}