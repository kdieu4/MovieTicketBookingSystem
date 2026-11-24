/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.service;

import com.mtbs.movie_service.domain.dto.request.MovieRequest;
import com.mtbs.movie_service.domain.dto.response.MoviePageResponse;
import com.mtbs.movie_service.domain.dto.response.MovieResponse;
import com.mtbs.movie_service.domain.entity.enums.MovieStatus;

import java.util.List;
/**
 *
 * @author quanghieu
 */
public interface MovieService {

    MovieResponse getMovieById(Long movieId);

    List<MovieResponse> getAllMovies();

    MovieResponse createMovie(MovieRequest request);

    MovieResponse updateMovie(Long movieId, MovieRequest request);

    void deleteMovie(Long movieId);

    List<MovieResponse> searchMovies(MovieStatus status, List<Long> genreIds, String title);

    /**
     * Mot trang phim theo bo loc, kem so phim cua tung the loai.
     *
     * @param page so trang, bat dau tu 0
     * @param size so phim moi trang
     */
    MoviePageResponse searchMoviesPaged(MovieStatus status, List<Long> genreIds, String title, int page, int size);

    /** Ten cac phim theo trang thai, dung cho goi y tim kiem. */
    List<String> getMovieTitles(MovieStatus status);

    List<MovieResponse> searchByKeyword(String keyword, int limit);
}