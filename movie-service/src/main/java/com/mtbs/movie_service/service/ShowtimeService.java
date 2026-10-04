/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.service;
 
import com.mtbs.movie_service.domain.dto.request.ShowtimeRequest;
import com.mtbs.movie_service.domain.dto.response.ShowtimeResponse;
 
import java.util.List;
/**
 *
 * @author quanghieu
 */
public interface ShowtimeService {
 
    List<ShowtimeResponse> getAllShowtimes();
 
    ShowtimeResponse getShowtimeById(Long showtimeId);
 
    ShowtimeResponse createShowtime(ShowtimeRequest request);
 
    ShowtimeResponse updateShowtime(Long showtimeId, ShowtimeRequest request);
 
    void deleteShowtime(Long showtimeId);
}