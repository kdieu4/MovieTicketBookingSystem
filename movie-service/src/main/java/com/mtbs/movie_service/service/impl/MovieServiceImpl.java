/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.request.MovieRequest;
import com.mtbs.movie_service.domain.dto.response.GenreResponse;
import com.mtbs.movie_service.domain.dto.response.MovieResponse;
import com.mtbs.movie_service.domain.entity.Genre;
import com.mtbs.movie_service.domain.entity.Movie;
import com.mtbs.movie_service.domain.entity.enums.MovieStatus;
import com.mtbs.movie_service.exception.MovieNotFoundException;
import com.mtbs.movie_service.repository.GenreRepository;
import com.mtbs.movie_service.repository.MovieRepository;
import com.mtbs.movie_service.service.MovieService;
import com.mtbs.movie_service.specification.MovieSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
/**
 *
 * @author quanghieu
 */
@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long movieId) {
        return toResponse(findMovieOrThrow(movieId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Movie movie = new Movie();
        applyRequest(movie, request);
        return toResponse(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public MovieResponse updateMovie(Long movieId, MovieRequest request) {
        Movie movie = findMovieOrThrow(movieId);
        applyRequest(movie, request);
        return toResponse(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public void deleteMovie(Long movieId) {
        movieRepository.delete(findMovieOrThrow(movieId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> searchMovies(MovieStatus status, List<Long> genreIds, String title) {
        Specification<Movie> spec = Specification.where(MovieSpecifications.hasStatus(status))
                .and(MovieSpecifications.hasAnyGenre(genreIds))
                .and(MovieSpecifications.titleContains(title));

        return movieRepository.findAll(spec).stream()
                .map(this::toResponse)
                .toList();
    }

    private Movie findMovieOrThrow(Long movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new MovieNotFoundException(movieId));
    }

    private void applyRequest(Movie movie, MovieRequest request) {
        movie.setTitle(request.title());
        movie.setDescription(request.description());
        movie.setDurationMinutes(request.durationMinutes());
        movie.setLanguage(request.language());
        movie.setReleaseDate(request.releaseDate());
        movie.setPosterUrl(request.posterUrl());
        movie.setTrailerUrl(request.trailerUrl());
        movie.setAgeRestriction(request.ageRestriction());
        movie.setStatus(request.status());
        movie.setDirector(request.director());
        movie.setActors(request.actors());
        movie.setGenres(resolveGenres(request.genreIds()));
    }

    private Set<Genre> resolveGenres(Set<Long> genreIds) {
        if (genreIds == null || genreIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Genre> found = genreRepository.findAllById(genreIds);
        if (found.size() != genreIds.size()) {
            throw new IllegalArgumentException("Một hoặc nhiều genreId không tồn tại trong bảng genres");
        }
        return new HashSet<>(found);
    }

    private MovieResponse toResponse(Movie movie) {
        List<GenreResponse> genres = movie.getGenres().stream()
                .map(g -> new GenreResponse(g.getGenreId(), g.getName()))
                .toList();

        return new MovieResponse(
                movie.getMovieId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getDurationMinutes(),
                movie.getLanguage(),
                movie.getReleaseDate(),
                movie.getPosterUrl(),
                movie.getTrailerUrl(),
                movie.getAgeRestriction(),
                movie.getStatus(),
                movie.getDirector(),
                movie.getActors(),
                genres,
                movie.getCreatedAt(),
                movie.getUpdatedAt()
        );
    }
}