/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.mtbs.movie_service.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
/**
 *
 * @author quanghieu
 */ 
public record CinemaRequest(
        @NotBlank(message = "Name must not be blank")
        String name,

        @NotBlank(message = "Address must not be blank")
        String address,

        @NotBlank(message = "City must not be blank")
        String city,

        String phoneNumber
) {
}