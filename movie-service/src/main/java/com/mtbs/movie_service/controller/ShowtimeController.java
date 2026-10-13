/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.request.ShowtimeRequest;
import com.mtbs.movie_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.movie_service.service.ShowtimeService;

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
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping("/getShowtimes")
    public ResponseEntity<List<ShowtimeResponse>> getAllShowtimes(
            @RequestParam(required = false) Long movieId) {
        if (movieId != null) {
            return ResponseEntity.ok(showtimeService.getShowtimesByMovieId(movieId));
        }
        return ResponseEntity.ok(showtimeService.getAllShowtimes());
    }

    @GetMapping("/getShowtimeById")
    public ResponseEntity<ShowtimeResponse> getShowtimeById(@RequestParam Long showtimeId) {
        return ResponseEntity.ok(showtimeService.getShowtimeById(showtimeId));
    }

    @PostMapping("/createShowtime")
    public ResponseEntity<ShowtimeResponse> createShowtime(@Valid @RequestBody ShowtimeRequest request) {
        ShowtimeResponse response = showtimeService.createShowtime(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/updateShowtime")
    public ResponseEntity<ShowtimeResponse> updateShowtime(
            @RequestParam Long showtimeId,
            @Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.ok(showtimeService.updateShowtime(showtimeId, request));
    }

    @DeleteMapping("/deleteShowtime")
    public ResponseEntity<Void> deleteShowtime(@RequestParam Long showtimeId) {
        showtimeService.deleteShowtime(showtimeId);
        return ResponseEntity.noContent().build();
    }
}