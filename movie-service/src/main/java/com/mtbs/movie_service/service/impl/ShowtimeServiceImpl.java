/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.request.ShowtimeRequest;
import com.mtbs.movie_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.movie_service.domain.entity.Movie;
import com.mtbs.movie_service.domain.entity.Room;
import com.mtbs.movie_service.domain.entity.Showtime;
import com.mtbs.movie_service.exception.MovieNotFoundException;
import com.mtbs.movie_service.exception.RoomNotFoundException;
import com.mtbs.movie_service.exception.ShowtimeNotFoundException;
import com.mtbs.movie_service.repository.MovieRepository;
import com.mtbs.movie_service.repository.RoomRepository;
import com.mtbs.movie_service.repository.ShowtimeRepository;
import com.mtbs.movie_service.service.ShowtimeService;

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
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getAllShowtimes() {
        return showtimeRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimeById(Long showtimeId) {
        return toResponse(findShowtimeOrThrow(showtimeId));
    }

    @Override
    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeRequest request) {
        Showtime showtime = new Showtime();
        applyRequest(showtime, request);
        return toResponse(showtimeRepository.save(showtime));
    }

    @Override
    @Transactional
    public ShowtimeResponse updateShowtime(Long showtimeId, ShowtimeRequest request) {
        Showtime showtime = findShowtimeOrThrow(showtimeId);
        applyRequest(showtime, request);
        return toResponse(showtimeRepository.save(showtime));
    }

    @Override
    @Transactional
    public void deleteShowtime(Long showtimeId) {
        showtimeRepository.delete(findShowtimeOrThrow(showtimeId));
    }

    private Showtime findShowtimeOrThrow(Long showtimeId) {
        return showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ShowtimeNotFoundException(showtimeId));
    }

    private void applyRequest(Showtime showtime, ShowtimeRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("endTime phải sau startTime");
        }

        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new MovieNotFoundException(request.movieId()));
        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new RoomNotFoundException(request.roomId()));

        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(request.startTime());
        showtime.setEndTime(request.endTime());
        showtime.setBasePrice(request.basePrice());
        showtime.setStatus(request.status());
    }

    private ShowtimeResponse toResponse(Showtime showtime) {
        return new ShowtimeResponse(
                showtime.getShowtimeId(),
                showtime.getMovie().getMovieId(),
                showtime.getRoom().getRoomId(),
                showtime.getStartTime(),
                showtime.getEndTime(),
                showtime.getBasePrice(),
                showtime.getStatus()
        );
    }
}