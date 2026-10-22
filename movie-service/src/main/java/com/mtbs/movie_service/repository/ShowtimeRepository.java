/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.repository;

import com.mtbs.movie_service.domain.entity.Showtime;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
/**
 *
 * @author quanghieu
 */
@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long>, JpaSpecificationExecutor<Showtime> {

    @Override
    @EntityGraph(attributePaths = {"room", "room.cinema", "movie"})
    List<Showtime> findAll(Specification<Showtime> spec, Sort sort);

    List<Showtime> findByMovie_MovieId(Long movieId);

    List<Showtime> findByRoom_RoomId(Long roomId);

    // Khóa suất chiếu khi tạo ghế để hai request đồng thời không tạo trùng.
    @Query(value = "SELECT room_id FROM showtimes WHERE showtime_id = :showtimeId FOR UPDATE", nativeQuery = true)
    Optional<Long> findRoomIdForUpdate(@Param("showtimeId") Long showtimeId);

    @Query("SELECT COUNT(s) > 0 FROM Showtime s WHERE s.room.roomId = :roomId " +
           "AND (:showtimeId IS NULL OR s.showtimeId <> :showtimeId) " +
           "AND s.startTime < :endTime AND s.endTime > :startTime")
    boolean existsOverlappingShowtime(
            @Param("roomId") Long roomId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime,
            @Param("showtimeId") Long showtimeId);
}