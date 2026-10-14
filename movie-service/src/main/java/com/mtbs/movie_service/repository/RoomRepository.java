/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.repository;

import com.mtbs.movie_service.domain.entity.Room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
/**
 *
 * @author quanghieu
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByCinema_CinemaId(Long cinemaId);

    boolean existsByCinema_CinemaIdAndName(Long cinemaId, String name);
}