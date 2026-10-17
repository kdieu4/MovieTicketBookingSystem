/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.repository;

import com.mtbs.movie_service.domain.entity.ShowtimeSeat;
import com.mtbs.movie_service.domain.entity.enums.SeatStatus;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, Long> {

    @EntityGraph(attributePaths = "seat")
    List<ShowtimeSeat> findByShowtime_ShowtimeId(Long showtimeId);

    List<ShowtimeSeat> findByShowtime_ShowtimeIdAndStatus(Long showtimeId, SeatStatus status);

    long countByShowtime_ShowtimeId(Long showtimeId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE ShowtimeSeat s
               SET s.status = :holding,
                   s.holdBy = :holder,
                   s.holdUntil = :holdUntil,
                   s.updatedAt = :now
             WHERE s.showtimeSeatId = :seatId
               AND s.showtime.showtimeId = :showtimeId
               AND (s.status = :available
                    OR (s.status = :holding
                        AND (s.holdUntil IS NULL OR s.holdUntil < :now OR s.holdBy = :holder)))
            """)
    int holdSeat(@Param("seatId") Long seatId,
                 @Param("showtimeId") Long showtimeId,
                 @Param("holder") String holder,
                 @Param("now") OffsetDateTime now,
                 @Param("holdUntil") OffsetDateTime holdUntil,
                 @Param("available") SeatStatus available,
                 @Param("holding") SeatStatus holding);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE ShowtimeSeat s
               SET s.status = :available,
                   s.holdBy = null,
                   s.holdUntil = null,
                   s.updatedAt = :now
             WHERE s.showtimeSeatId IN :seatIds
               AND s.showtime.showtimeId = :showtimeId
               AND s.status = :holding
               AND s.holdBy = :holder
            """)
    int releaseSeats(@Param("seatIds") List<Long> seatIds,
                     @Param("showtimeId") Long showtimeId,
                     @Param("holder") String holder,
                     @Param("now") OffsetDateTime now,
                     @Param("available") SeatStatus available,
                     @Param("holding") SeatStatus holding);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE ShowtimeSeat s
               SET s.status = :booked,
                   s.holdBy = null,
                   s.holdUntil = null,
                   s.updatedAt = :now
             WHERE s.showtimeSeatId IN :seatIds
               AND s.showtime.showtimeId = :showtimeId
               AND s.status = :holding
               AND s.holdBy = :holder
               AND s.holdUntil >= :now
            """)
    int confirmSeats(@Param("seatIds") List<Long> seatIds,
                     @Param("showtimeId") Long showtimeId,
                     @Param("holder") String holder,
                     @Param("now") OffsetDateTime now,
                     @Param("holding") SeatStatus holding,
                     @Param("booked") SeatStatus booked);
    
    @Query("SELECT ss.seat.seatId FROM ShowtimeSeat ss WHERE ss.showtime.showtimeId = :showtimeId")
    List<Long> findSeatIdsByShowtimeId(@Param("showtimeId") Long showtimeId);
}