/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.request.SeatActionRequest;
import com.mtbs.movie_service.domain.dto.request.ShowtimeRequest;
import com.mtbs.movie_service.domain.dto.response.SeatActionResponse;
import com.mtbs.movie_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.movie_service.domain.dto.response.ShowtimeSearchResponse;
import com.mtbs.movie_service.domain.dto.response.ShowtimeSeatResponse;
import com.mtbs.movie_service.service.ShowtimeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    public ResponseEntity<ShowtimeResponse> getShowtimeById(@RequestParam Long id) {
        return ResponseEntity.ok(showtimeService.getShowtimeById(id));
    }

    @GetMapping("/searchShowtimes")
    public ResponseEntity<List<ShowtimeSearchResponse>> searchShowtimes(
            @RequestParam String city,
            @RequestParam(required = false) String cinema,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String movieTitle) {
        return ResponseEntity.ok(showtimeService.searchShowtimes(city, cinema, date, movieTitle));
    }

    @GetMapping("/getSeatsByShowtime")
    public ResponseEntity<List<ShowtimeSeatResponse>> getSeatsByShowtime(
            @RequestParam Long showtimeId,
            @RequestParam(required = false) String sessionId) {
        return ResponseEntity.ok(showtimeService.getSeatsByShowtime(showtimeId, sessionId));
    }

    @PostMapping("/holdSeats")
    public ResponseEntity<SeatActionResponse> holdSeats(
            @RequestParam Long showtimeId,
            @Valid @RequestBody SeatActionRequest request) {
        return ResponseEntity.ok(showtimeService.holdSeats(showtimeId, request));
    }

    @PostMapping("/releaseSeats")
    public ResponseEntity<SeatActionResponse> releaseSeats(
            @RequestParam Long showtimeId,
            @Valid @RequestBody SeatActionRequest request) {
        return ResponseEntity.ok(showtimeService.releaseSeats(showtimeId, request));
    }

    @PostMapping("/confirmSeats")
    public ResponseEntity<SeatActionResponse> confirmSeats(
            @RequestParam Long showtimeId,
            @Valid @RequestBody SeatActionRequest request) {
        return ResponseEntity.ok(showtimeService.confirmSeats(showtimeId, request));
    }

    @PostMapping("/createShowtime")
    public ResponseEntity<ShowtimeResponse> createShowtime(@Valid @RequestBody ShowtimeRequest request) {
        ShowtimeResponse response = showtimeService.createShowtime(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/updateShowtime")
    public ResponseEntity<ShowtimeResponse> updateShowtime(
            @RequestParam Long id,
            @Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.ok(showtimeService.updateShowtime(id, request));
    }

    @DeleteMapping("/deleteShowtime")
    public ResponseEntity<Void> deleteShowtime(@RequestParam Long id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.noContent().build();
    }
}