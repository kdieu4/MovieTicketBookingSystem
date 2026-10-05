/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.response.CinemaResponse;
import com.mtbs.movie_service.domain.entity.Cinema;
import com.mtbs.movie_service.exception.CinemaNotFoundException;
import com.mtbs.movie_service.repository.CinemaRepository;
import com.mtbs.movie_service.service.CinemaService;

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
public class CinemaServiceImpl implements CinemaService {

    private final CinemaRepository cinemaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CinemaResponse> getAllCinemas() {
        return cinemaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CinemaResponse getCinemaById(Long cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new CinemaNotFoundException(cinemaId));
        return toResponse(cinema);
    }

    private CinemaResponse toResponse(Cinema cinema) {
        return new CinemaResponse(
                cinema.getCinemaId(),
                cinema.getName(),
                cinema.getAddress(),
                cinema.getCity(),
                cinema.getPhoneNumber(),
                cinema.getCreatedAt(),
                cinema.getUpdatedAt()
        );
    }
}
