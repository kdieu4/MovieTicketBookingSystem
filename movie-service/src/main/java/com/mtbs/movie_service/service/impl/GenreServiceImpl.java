/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.request.GenreRequest;
import com.mtbs.movie_service.domain.dto.response.GenreResponse;
import com.mtbs.movie_service.domain.entity.Genre;
import com.mtbs.movie_service.exception.GenreNotFoundException;
import com.mtbs.movie_service.repository.GenreRepository;
import com.mtbs.movie_service.service.GenreService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 *
 * @author quanghieu
 */
@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GenreResponse getGenreById(Long genreId) {
        Genre genre = findGenreOrThrow(genreId);
        return toResponse(genre);
    }

    @Override
    @Transactional
    public GenreResponse createGenre(GenreRequest request) {
        if (genreRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Tên thể loại đã tồn tại: " + request.name());
        }
        Genre genre = new Genre();
        genre.setName(request.name());
        return toResponse(genreRepository.save(genre));
    }

    @Override
    @Transactional
    public GenreResponse updateGenre(Long genreId, GenreRequest request) {
        Genre genre = findGenreOrThrow(genreId);
        if (!genre.getName().equals(request.name()) && genreRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Tên thể loại đã tồn tại: " + request.name());
        }
        genre.setName(request.name());
        return toResponse(genreRepository.save(genre));
    }

    @Override
    @Transactional
    public void deleteGenre(Long genreId) {
        Genre genre = findGenreOrThrow(genreId);
        genreRepository.delete(genre);
    }

    private Genre findGenreOrThrow(Long genreId) {
        return genreRepository.findById(genreId)
                .orElseThrow(() -> new GenreNotFoundException(genreId));
    }

    private GenreResponse toResponse(Genre genre) {
        return new GenreResponse(genre.getGenreId(), genre.getName());
    }
}