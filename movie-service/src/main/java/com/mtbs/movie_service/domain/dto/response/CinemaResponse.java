/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.response;

import java.time.OffsetDateTime;
/**
 *
 * @author quanghieu
 */
public record CinemaResponse(
        Long cinemaId,
        String name,
        String address,
        String city,
        String phoneNumber,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}