/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.service;

import com.mtbs.movie_service.domain.dto.request.RoomRequest;
import com.mtbs.movie_service.domain.dto.response.RoomResponse;

import java.util.List;
/**
 *
 * @author quanghieu
 */
public interface RoomService {

    List<RoomResponse> getAllRooms();

    List<RoomResponse> getRoomsByCinemaId(Long cinemaId);

    RoomResponse getRoomById(Long roomId);

    RoomResponse createRoom(RoomRequest request);

    RoomResponse updateRoom(Long roomId, RoomRequest request);

    void deleteRoom(Long roomId);
}