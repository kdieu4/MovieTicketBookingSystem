/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.request.MovieRequest;
import com.mtbs.movie_service.domain.dto.response.MovieResponse;
import com.mtbs.movie_service.domain.entity.enums.MovieStatus;
import com.mtbs.movie_service.service.MovieService;

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
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/getMovies")
    public ResponseEntity<List<MovieResponse>> getMovies(
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(required = false) List<Long> genreIds,
            @RequestParam(required = false) String title) {
        return ResponseEntity.ok(movieService.searchMovies(status, genreIds, title));
    }

    @GetMapping("/getMovieById")
    public ResponseEntity<MovieResponse> getMovieById(@RequestParam Long movieId) {
        return ResponseEntity.ok(movieService.getMovieById(movieId));
    }

    @PostMapping("/createMovie")
    public ResponseEntity<MovieResponse> createMovie(@Valid @RequestBody MovieRequest request) {
        MovieResponse response = movieService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/updateMovie")
    public ResponseEntity<MovieResponse> updateMovie(
            @RequestParam Long movieId,
            @Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(movieService.updateMovie(movieId, request));
    }

    @DeleteMapping("/deleteMovie")
    public ResponseEntity<Void> deleteMovie(@RequestParam Long movieId) {
        movieService.deleteMovie(movieId);
        return ResponseEntity.noContent().build();
    }
}