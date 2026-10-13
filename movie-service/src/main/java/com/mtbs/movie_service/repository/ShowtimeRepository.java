/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.repository;

import com.mtbs.movie_service.domain.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
/**
 *
 * @author quanghieu
 */
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByMovie_MovieId(Long movieId);
}