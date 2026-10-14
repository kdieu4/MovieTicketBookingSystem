/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.repository;

import com.mtbs.movie_service.domain.entity.ShowtimeSeat;
import com.mtbs.movie_service.domain.entity.enums.SeatStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
/**
 *
 * @author quanghieu
 */
@Repository
public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, Long> {
    List<ShowtimeSeat> findByShowtime_ShowtimeId(Long showtimeId);
    List<ShowtimeSeat> findByShowtime_ShowtimeIdAndStatus(Long showtimeId, SeatStatus status);
}