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
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping
    public ResponseEntity<List<ShowtimeResponse>> getAllShowtimes() {
        return ResponseEntity.ok(showtimeService.getAllShowtimes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowtimeResponse> getShowtimeById(@PathVariable Long id) {
        return ResponseEntity.ok(showtimeService.getShowtimeById(id));
    }

    @PostMapping
    public ResponseEntity<ShowtimeResponse> createShowtime(@Valid @RequestBody ShowtimeRequest request) {
        ShowtimeResponse response = showtimeService.createShowtime(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShowtimeResponse> updateShowtime(
            @PathVariable Long id, @Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.ok(showtimeService.updateShowtime(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.noContent().build();
    }
}