/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */
package com.example.booking_service.dto;

import com.example.booking_service.enums.AgeRestriction;
import com.example.booking_service.enums.MovieStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
 
import java.time.LocalDate;
import java.util.Set;
/**
 *
 * @author quanghieu
 */
public record MovieRequest(        
        @NotBlank(message = "title không được để trống")
        @Size(max = 255, message = "title tối đa 255 ký tự")
        String title,
 
        String description,
 
        @Positive(message = "durationMinutes phải lớn hơn 0")
        Short durationMinutes,
 
        String language,
 
        LocalDate releaseDate,
 
        String posterUrl,
 
        String trailerUrl,
 
        AgeRestriction ageRestriction,
 
        MovieStatus status,
 
        String director,
 
        String actors,
 
        Set<Long> genreIds
) {

}