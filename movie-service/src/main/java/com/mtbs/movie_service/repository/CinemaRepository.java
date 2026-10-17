/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.repository;

import com.mtbs.movie_service.domain.entity.Cinema;
import com.mtbs.movie_service.domain.entity.enums.ShowtimeStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
/**
 *
 * @author quanghieu
 */
@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Long> {

    boolean existsByNameAndAddress(String name, String address);

    @Query("SELECT DISTINCT c.city FROM Cinema c WHERE c.city IS NOT NULL AND c.city != '' ORDER BY c.city ASC")
    List<String> findDistinctCities();

    List<Cinema> findByCityIgnoreCase(String city);

    @Query("""
            SELECT DISTINCT c FROM Cinema c
            JOIN Room r ON r.cinema = c
            JOIN Showtime s ON s.room = r
            JOIN s.movie m
            WHERE LOWER(c.city) = LOWER(:city)
              AND LOWER(m.title) LIKE LOWER(CONCAT('%', :movieTitle, '%'))
              AND s.startTime >= :fromTime
              AND s.startTime < :toTime
              AND (s.status IS NULL OR s.status <> :cancelled)
            ORDER BY c.name ASC
            """)
    List<Cinema> findCinemasShowingMovie(@Param("city") String city,
                                         @Param("movieTitle") String movieTitle,
                                         @Param("fromTime") OffsetDateTime fromTime,
                                         @Param("toTime") OffsetDateTime toTime,
                                         @Param("cancelled") ShowtimeStatus cancelled);
}