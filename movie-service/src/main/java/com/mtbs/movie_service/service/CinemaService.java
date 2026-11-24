/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.service;

import com.mtbs.movie_service.domain.dto.request.CinemaRequest;
import com.mtbs.movie_service.domain.dto.response.CinemaResponse;
import com.mtbs.movie_service.domain.dto.response.PageResponse;

import java.util.List;
/**
 *
 * @author quanghieu
 */
public interface CinemaService {

    List<CinemaResponse> getAllCinemas();

    /** Mot trang rap, sap theo ten rap. */
    PageResponse<CinemaResponse> getAllCinemasPaged(int page, int size);

    CinemaResponse getCinemaById(Long cinemaId);

    List<String> getAllCities();

    List<CinemaResponse> getCinemasByCity(String city, String movieTitle);

    /** Mot trang rap theo thanh pho (va tu khoa phim neu co). */
    PageResponse<CinemaResponse> getCinemasByCityPaged(String city, String movieTitle, int page, int size);

    CinemaResponse createCinema(CinemaRequest request);

    CinemaResponse updateCinema(Long cinemaId, CinemaRequest request);

    void deleteCinema(Long cinemaId);
}