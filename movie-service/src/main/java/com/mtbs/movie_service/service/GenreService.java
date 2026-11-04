/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.service;

import com.mtbs.movie_service.domain.dto.request.GenreRequest;
import com.mtbs.movie_service.domain.dto.response.GenreResponse;

import java.util.List;
/**
 *
 * @author quanghieu
 */
public interface GenreService {

    List<GenreResponse> getAllGenres();

    GenreResponse getGenreById(Long genreId);

    GenreResponse createGenre(GenreRequest request);

    GenreResponse updateGenre(Long genreId, GenreRequest request);

    void deleteGenre(Long genreId);
}