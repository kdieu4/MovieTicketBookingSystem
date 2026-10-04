/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.service;

/**
 *
 * @author quanghieu
 */
import com.mtbs.movie_service.domain.dto.request.MovieRequest;
import com.mtbs.movie_service.domain.dto.response.MovieResponse;
import com.mtbs.movie_service.domain.entity.enums.MovieStatus;

import java.util.List;

public interface MovieService {

    MovieResponse getMovieById(Long movieId);

    List<MovieResponse> getAllMovies();

    MovieResponse createMovie(MovieRequest request);

    MovieResponse updateMovie(Long movieId, MovieRequest request);

    void deleteMovie(Long movieId);

    List<MovieResponse> searchMovies(MovieStatus status, List<Long> genreIds, String title);
}