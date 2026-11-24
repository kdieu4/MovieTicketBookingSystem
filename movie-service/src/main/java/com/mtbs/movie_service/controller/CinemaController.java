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
public class CinemaController {

    private final CinemaService cinemaService;

    @GetMapping("/getCinemas")
    public ResponseEntity<?> getAllCinemas(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        // Khong truyen page/size thi tra mang nhu cu de khong lam vo client cu.
        if (page == null && size == null) {
            return ResponseEntity.ok(cinemaService.getAllCinemas());
        }
        return ResponseEntity.ok(cinemaService.getAllCinemasPaged(
                page == null ? 0 : page, size == null ? 0 : size));
    }

    @GetMapping("/getCinemaById")
    public ResponseEntity<CinemaResponse> getCinemaById(@RequestParam Long id) {
        return ResponseEntity.ok(cinemaService.getCinemaById(id));
    }

    @GetMapping("/getCities")
    public ResponseEntity<List<String>> getAllCities() {
        return ResponseEntity.ok(cinemaService.getAllCities());
    }

    @GetMapping("/getCinemasByCity")
    public ResponseEntity<?> getCinemasByCity(
            @RequestParam String city,
            @RequestParam(required = false) String movieTitle,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page == null && size == null) {
            return ResponseEntity.ok(cinemaService.getCinemasByCity(city, movieTitle));
        }
        return ResponseEntity.ok(cinemaService.getCinemasByCityPaged(
                city, movieTitle, page == null ? 0 : page, size == null ? 0 : size));
    }

    @PostMapping("/createCinema")
    public ResponseEntity<CinemaResponse> createCinema(@Valid @RequestBody CinemaRequest request) {
        CinemaResponse response = cinemaService.createCinema(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/updateCinema")
    public ResponseEntity<CinemaResponse> updateCinema(
            @RequestParam Long id,
            @Valid @RequestBody CinemaRequest request) {
        return ResponseEntity.ok(cinemaService.updateCinema(id, request));
    }

    @DeleteMapping("/deleteCinema")
    public ResponseEntity<Void> deleteCinema(@RequestParam Long id) {
        cinemaService.deleteCinema(id);
        return ResponseEntity.noContent().build();
    }
}