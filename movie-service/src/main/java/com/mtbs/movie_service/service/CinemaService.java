/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.service;

import com.mtbs.movie_service.domain.dto.request.CinemaRequest;
import com.mtbs.movie_service.domain.dto.response.CinemaResponse;

import java.util.List;
/**
 *
 * @author quanghieu
 */
public interface CinemaService {

    List<CinemaResponse> getAllCinemas();

    CinemaResponse getCinemaById(Long cinemaId);

    CinemaResponse createCinema(CinemaRequest request);

    CinemaResponse updateCinema(Long cinemaId, CinemaRequest request);

    void deleteCinema(Long cinemaId);
}