    /*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.request.CinemaRequest;
import com.mtbs.movie_service.domain.dto.response.CinemaResponse;
import com.mtbs.movie_service.domain.dto.response.PageResponse;
import com.mtbs.movie_service.domain.entity.Cinema;
import com.mtbs.movie_service.domain.entity.enums.ShowtimeStatus;
import com.mtbs.movie_service.exception.CinemaNotFoundException;
import com.mtbs.movie_service.repository.CinemaRepository;
import com.mtbs.movie_service.service.CinemaService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
/**
 *
 * @author quanghieu
 */
@Service
@RequiredArgsConstructor
public class CinemaServiceImpl implements CinemaService {

    private static final ZoneId CINEMA_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int SEARCH_WINDOW_DAYS = 30;
    private static final int DEFAULT_PAGE_SIZE = 9;
    private static final int MAX_PAGE_SIZE = 60;
    /** Danh sach rap luon xep theo ten de nguoi dung de tra. */
    private static final Sort BY_NAME = Sort.by(Sort.Direction.ASC, "name");

    private final CinemaRepository cinemaRepository;

    @Override
    public List<CinemaResponse> getAllCinemas() {
        return cinemaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CinemaResponse> getAllCinemasPaged(int page, int size) {
        Page<Cinema> result = cinemaRepository.findAll(
                PageRequest.of(safePage(page), safeSize(size), BY_NAME));
        return PageResponse.from(result, this::toResponse);
    }

    @Override
    public CinemaResponse getCinemaById(Long cinemaId) {
        Cinema cinema = findCinemaOrThrow(cinemaId);
        return toResponse(cinema);
    }

    @Override
    public List<String> getAllCities() {
        return cinemaRepository.findDistinctCities();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CinemaResponse> getCinemasByCityPaged(String city, String movieTitle, int page, int size) {
        if (city == null || city.isBlank()) {
            return getAllCinemasPaged(page, size);
        }

        Page<Cinema> result;

        if (movieTitle == null || movieTitle.isBlank()) {
            result = cinemaRepository.findByCityIgnoreCase(
                    city.trim(), PageRequest.of(safePage(page), safeSize(size), BY_NAME));
        } else {
            // Truy van theo phim dang chieu khong tra Page nen cat trang tai cho;
            // danh sach nay nho (mot thanh pho) nen khong ton kem.
            LocalDate today = LocalDate.now(CINEMA_ZONE);
            OffsetDateTime from = today.atStartOfDay(CINEMA_ZONE).toOffsetDateTime();
            OffsetDateTime to = today.plusDays(SEARCH_WINDOW_DAYS).atStartOfDay(CINEMA_ZONE).toOffsetDateTime();

            List<Cinema> all = cinemaRepository.findCinemasShowingMovie(
                    city.trim(), movieTitle.trim(), from, to, ShowtimeStatus.CANCELLED);
            result = sliceAsPage(all, page, size);
        }

        return PageResponse.from(result, this::toResponse);
    }

    private static Page<Cinema> sliceAsPage(List<Cinema> all, int page, int size) {
        int safePage = safePage(page);
        int safeSize = safeSize(size);
        int fromIndex = Math.min(safePage * safeSize, all.size());
        int toIndex = Math.min(fromIndex + safeSize, all.size());

        return new org.springframework.data.domain.PageImpl<>(
                all.subList(fromIndex, toIndex),
                PageRequest.of(safePage, safeSize, BY_NAME),
                all.size());
    }

    private static int safePage(int page) {
        return Math.max(page, 0);
    }

    private static int safeSize(int size) {
        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaResponse> getCinemasByCity(String city, String movieTitle) {
        if (movieTitle == null || movieTitle.isBlank()) {
            return cinemaRepository.findByCityIgnoreCase(city)
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }
        LocalDate today = LocalDate.now(CINEMA_ZONE);
        OffsetDateTime from = today.atStartOfDay(CINEMA_ZONE).toOffsetDateTime();
        OffsetDateTime to = today.plusDays(SEARCH_WINDOW_DAYS).atStartOfDay(CINEMA_ZONE).toOffsetDateTime();

        return cinemaRepository.findCinemasShowingMovie(
                        city.trim(), movieTitle.trim(), from, to, ShowtimeStatus.CANCELLED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CinemaResponse createCinema(CinemaRequest request) {
        Cinema cinema = new Cinema();
        cinema.setName(request.name());
        cinema.setAddress(request.address());
        cinema.setCity(request.city());
        cinema.setPhoneNumber(request.phoneNumber());
        return toResponse(cinemaRepository.save(cinema));
    }

    @Override
    @Transactional
    public CinemaResponse updateCinema(Long cinemaId, CinemaRequest request) {
        Cinema cinema = findCinemaOrThrow(cinemaId);
        cinema.setName(request.name());
        cinema.setAddress(request.address());
        cinema.setCity(request.city());
        cinema.setPhoneNumber(request.phoneNumber());
        return toResponse(cinemaRepository.save(cinema));
    }

    @Override
    @Transactional
    public void deleteCinema(Long cinemaId) {
        Cinema cinema = findCinemaOrThrow(cinemaId);
        cinemaRepository.delete(cinema);
    }

    private Cinema findCinemaOrThrow(Long cinemaId) {
        return cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new CinemaNotFoundException(cinemaId));
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