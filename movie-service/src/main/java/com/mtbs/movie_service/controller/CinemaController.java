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
import org.springframework.web.bind.annotation.*;

import java.util.List;
/**
 *
 * @author quanghieu
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CinemaController {

    private final CinemaService cinemaService;

    @GetMapping("/getCinemas")
    public ResponseEntity<List<CinemaResponse>> getAllCinemas() {
        return ResponseEntity.ok(cinemaService.getAllCinemas());
    }

    @GetMapping("/getCinemaById")
    public ResponseEntity<CinemaResponse> getCinemaById(@RequestParam Long cinemaId) {
        return ResponseEntity.ok(cinemaService.getCinemaById(cinemaId));
    }

    @PostMapping("/createCinema")
    public ResponseEntity<CinemaResponse> createCinema(@Valid @RequestBody CinemaRequest request) {
        CinemaResponse response = cinemaService.createCinema(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/updateCinema")
    public ResponseEntity<CinemaResponse> updateCinema(
            @RequestParam Long cinemaId,
            @Valid @RequestBody CinemaRequest request) {
        return ResponseEntity.ok(cinemaService.updateCinema(cinemaId, request));
    }

    @DeleteMapping("/deleteCinema")
    public ResponseEntity<Void> deleteCinema(@RequestParam Long cinemaId) {
        cinemaService.deleteCinema(cinemaId);
        return ResponseEntity.noContent().build();
    }
}