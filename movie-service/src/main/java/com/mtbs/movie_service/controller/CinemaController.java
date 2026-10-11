/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.request.CinemaRequest;
import com.mtbs.movie_service.domain.dto.response.CinemaResponse;
import com.mtbs.movie_service.service.CinemaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping
    public ResponseEntity<CinemaResponse> createCinema(@Valid @RequestBody CinemaRequest request) {
        CinemaResponse response = cinemaService.createCinema(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CinemaResponse> updateCinema(
            @PathVariable Long id,
            @Valid @RequestBody CinemaRequest request
    ) {
        return ResponseEntity.ok(cinemaService.updateCinema(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCinema(@PathVariable Long id) {
        cinemaService.deleteCinema(id);
        return ResponseEntity.noContent().build();
    }
}