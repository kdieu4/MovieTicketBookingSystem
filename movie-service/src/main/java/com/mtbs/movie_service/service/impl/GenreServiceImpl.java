/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.response.GenreResponse;
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
        return genreRepository.findAll().stream()
                .map(g -> new GenreResponse(g.getGenreId(), g.getName()))
                .toList();
    }
}