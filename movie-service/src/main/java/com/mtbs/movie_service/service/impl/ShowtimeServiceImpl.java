/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.request.ShowtimeRequest;
import com.mtbs.movie_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.movie_service.domain.entity.*;
import com.mtbs.movie_service.domain.entity.enums.SeatStatus;
import com.mtbs.movie_service.exception.MovieNotFoundException;
import com.mtbs.movie_service.exception.RoomNotFoundException;
import com.mtbs.movie_service.exception.ShowtimeNotFoundException;
import com.mtbs.movie_service.repository.*;
import com.mtbs.movie_service.service.ShowtimeService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
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
    private final SeatRepository seatRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getAllShowtimes() {
        return showtimeRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimesByMovieId(Long movieId) {
        if (!movieRepository.existsById(movieId)) {
            throw new MovieNotFoundException(movieId);
        }
        return showtimeRepository.findByMovie_MovieId(movieId).stream()
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
        applyRequest(showtime, request, null);
        Showtime savedShowtime = showtimeRepository.save(showtime);

        // Tự động sinh danh sách ghế cho suất chiếu này (showtime_seats)
        List<Seat> roomSeats = seatRepository.findByRoom_RoomId(savedShowtime.getRoom().getRoomId());
        if (!roomSeats.isEmpty()) {
            List<ShowtimeSeat> showtimeSeats = roomSeats.stream()
                    .map(seat -> ShowtimeSeat.builder()
                            .showtime(savedShowtime)
                            .seat(seat)
                            .status(SeatStatus.AVAILABLE)
                            .updatedAt(OffsetDateTime.now())
                            .build())
                    .toList();
            showtimeSeatRepository.saveAll(showtimeSeats);
        }

        return toResponse(savedShowtime);
    }

    @Override
    @Transactional
    public ShowtimeResponse updateShowtime(Long showtimeId, ShowtimeRequest request) {
        Showtime showtime = findShowtimeOrThrow(showtimeId);
        applyRequest(showtime, request, showtimeId);
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

    private void applyRequest(Showtime showtime, ShowtimeRequest request, Long currentShowtimeId) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("endTime phải sau startTime");
        }

        // Kiểm tra trùng lịch chiếu trong phòng
        boolean isOverlapped = showtimeRepository.existsOverlappingShowtime(
                request.roomId(),
                request.startTime(),
                request.endTime(),
                currentShowtimeId
        );
        if (isOverlapped) {
            throw new IllegalArgumentException("Phòng chiếu đã có suất chiếu khác trong khoảng thời gian này");
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
        Room room = showtime.getRoom();
        Cinema cinema = room != null ? room.getCinema() : null;

        return new ShowtimeResponse(
                showtime.getShowtimeId(),
                showtime.getMovie() != null ? showtime.getMovie().getMovieId() : null,
                room != null ? room.getRoomId() : null,
                room != null ? room.getName() : null,
                room != null ? room.getRoomType() : null,
                cinema != null ? cinema.getCinemaId() : null,
                cinema != null ? cinema.getName() : null,
                cinema != null ? cinema.getAddress() : null,
                cinema != null ? cinema.getCity() : null,
                showtime.getStartTime(),
                showtime.getEndTime(),
                showtime.getBasePrice(),
                showtime.getStatus()
        );
    }
}