/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.response.CinemaResponse;
import com.mtbs.movie_service.service.CinemaService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
/**
 *
 * @author quanghieu
 */
@RestController
@RequestMapping("/api/cinemas")
@RequiredArgsConstructor
public class CinemaController {

    private final CinemaService cinemaService;

    @GetMapping
    public ResponseEntity<List<CinemaResponse>> getAllCinemas() {
        return ResponseEntity.ok(cinemaService.getAllCinemas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CinemaResponse> getCinemaById(@PathVariable Long id) {
        return ResponseEntity.ok(cinemaService.getCinemaById(id));
    }
}