/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.request.MovieRequest;
import com.mtbs.movie_service.domain.dto.response.MovieResponse;
import com.mtbs.movie_service.domain.dto.response.TmdbReviewResponse;
import com.mtbs.movie_service.domain.entity.enums.MovieStatus;
import com.mtbs.movie_service.service.MovieService;
import com.mtbs.movie_service.service.TmdbService;

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
public class MovieController {

    private final MovieService movieService;
    private final TmdbService tmdbService;

    @GetMapping("/getMovies")
    public ResponseEntity<?> getMovies(
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(required = false) List<Long> genreIds,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        // Khong truyen page/size thi tra mang nhu cu, nho vay client cu khong bi vo.
        if (page == null && size == null) {
            return ResponseEntity.ok(movieService.searchMovies(status, genreIds, title));
        }
        return ResponseEntity.ok(movieService.searchMoviesPaged(
                status, genreIds, title, page == null ? 0 : page, size == null ? 0 : size));
    }

    @GetMapping("/getMovieTitles")
    public ResponseEntity<List<String>> getMovieTitles(@RequestParam(required = false) MovieStatus status) {
        return ResponseEntity.ok(movieService.getMovieTitles(status));
    }

    @GetMapping("/searchMovies")
    public ResponseEntity<List<MovieResponse>> searchMovies(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(movieService.searchByKeyword(keyword, limit));
    }

    @GetMapping("/getMovieById")
    public ResponseEntity<MovieResponse> getMovieById(@RequestParam Long id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    /** Review lay tu TMDB cho trang chi tiet phim. */
    @GetMapping("/getMovieReviews")
    public ResponseEntity<List<TmdbReviewResponse>> getMovieReviews(@RequestParam Long movieId) {
        return ResponseEntity.ok(tmdbService.getReviews(movieId));
    }

    @PostMapping("/createMovie")
    public ResponseEntity<MovieResponse> createMovie(@Valid @RequestBody MovieRequest request) {
        MovieResponse response = movieService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/updateMovie")
    public ResponseEntity<MovieResponse> updateMovie(
            @RequestParam Long id,
            @Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(movieService.updateMovie(id, request));
    }

    @DeleteMapping("/deleteMovie")
    public ResponseEntity<Void> deleteMovie(@RequestParam Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }
}