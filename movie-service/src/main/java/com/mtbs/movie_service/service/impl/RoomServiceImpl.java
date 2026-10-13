/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.request.RoomRequest;
import com.mtbs.movie_service.domain.dto.response.RoomResponse;
import com.mtbs.movie_service.domain.entity.Cinema;
import com.mtbs.movie_service.domain.entity.Room;
import com.mtbs.movie_service.exception.CinemaNotFoundException;
import com.mtbs.movie_service.exception.RoomNotFoundException;
import com.mtbs.movie_service.repository.CinemaRepository;
import com.mtbs.movie_service.repository.RoomRepository;
import com.mtbs.movie_service.service.RoomService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 *
 * @author quanghieu
 */
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final CinemaRepository cinemaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByCinemaId(Long cinemaId) {
        if (!cinemaRepository.existsById(cinemaId)) {
            throw new CinemaNotFoundException(cinemaId);
        }
        return roomRepository.findByCinema_CinemaId(cinemaId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long roomId) {
        return toResponse(findRoomOrThrow(roomId));
    }

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Room room = new Room();
        applyRequest(room, request);
        return toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long roomId, RoomRequest request) {
        Room room = findRoomOrThrow(roomId);
        applyRequest(room, request);
        return toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void deleteRoom(Long roomId) {
        roomRepository.delete(findRoomOrThrow(roomId));
    }

    private Room findRoomOrThrow(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException(roomId));
    }

    private void applyRequest(Room room, RoomRequest request) {
        Cinema cinema = cinemaRepository.findById(request.cinemaId())
                .orElseThrow(() -> new CinemaNotFoundException(request.cinemaId()));

        room.setCinema(cinema);
        room.setName(request.name());
        room.setTotalSeats(request.totalSeats());
        room.setRoomType(request.roomType());
    }

    private RoomResponse toResponse(Room room) {
        return new RoomResponse(
                room.getRoomId(),
                room.getCinema().getCinemaId(),
                room.getName(),
                room.getTotalSeats(),
                room.getRoomType(),
                room.getCreatedAt(),
                room.getUpdatedAt()
        );
    }
}