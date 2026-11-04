/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.service;

import com.mtbs.movie_service.domain.dto.request.SeatActionRequest;
import com.mtbs.movie_service.domain.dto.request.ShowtimeRequest;
import com.mtbs.movie_service.domain.dto.response.SeatActionResponse;
import com.mtbs.movie_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.movie_service.domain.dto.response.ShowtimeSearchResponse;
import com.mtbs.movie_service.domain.dto.response.ShowtimeSeatResponse;

import java.time.LocalDate;
import java.util.List;
/**
 *
 * @author quanghieu
 */
public interface ShowtimeService {

    List<ShowtimeResponse> getAllShowtimes();

    List<ShowtimeResponse> getShowtimesByMovieId(Long movieId);

    ShowtimeResponse getShowtimeById(Long showtimeId);

    ShowtimeResponse createShowtime(ShowtimeRequest request);

    ShowtimeResponse updateShowtime(Long showtimeId, ShowtimeRequest request);

    void deleteShowtime(Long showtimeId);

    List<ShowtimeSearchResponse> searchShowtimes(String city, String cinemaName, LocalDate date, String movieTitle);

    List<ShowtimeSeatResponse> getSeatsByShowtime(Long showtimeId, String sessionId);

    SeatActionResponse holdSeats(Long showtimeId, SeatActionRequest request);

    SeatActionResponse releaseSeats(Long showtimeId, SeatActionRequest request);

    SeatActionResponse confirmSeats(Long showtimeId, SeatActionRequest request);
}