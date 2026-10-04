/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.request.SeatRequest;
import com.mtbs.movie_service.domain.dto.response.SeatResponse;
import com.mtbs.movie_service.domain.entity.Room;
import com.mtbs.movie_service.domain.entity.Seat;
import com.mtbs.movie_service.exception.RoomNotFoundException;
import com.mtbs.movie_service.exception.SeatNotFoundException;
import com.mtbs.movie_service.repository.RoomRepository;
import com.mtbs.movie_service.repository.SeatRepository;
import com.mtbs.movie_service.service.SeatService;

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
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByRoomId(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new RoomNotFoundException(roomId);
        }
        return seatRepository.findByRoom_RoomId(roomId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SeatResponse getSeatById(Long seatId) {
        return toResponse(findSeatOrThrow(seatId));
    }

    @Override
    @Transactional
    public SeatResponse createSeat(SeatRequest request) {
        Seat seat = new Seat();
        applyRequest(seat, request);
        return toResponse(seatRepository.save(seat));
    }

    @Override
    @Transactional
    public SeatResponse updateSeat(Long seatId, SeatRequest request) {
        Seat seat = findSeatOrThrow(seatId);
        applyRequest(seat, request);
        return toResponse(seatRepository.save(seat));
    }

    @Override
    @Transactional
    public void deleteSeat(Long seatId) {
        seatRepository.delete(findSeatOrThrow(seatId));
    }

    private Seat findSeatOrThrow(Long seatId) {
        return seatRepository.findById(seatId)
                .orElseThrow(() -> new SeatNotFoundException(seatId));
    }

    private void applyRequest(Seat seat, SeatRequest request) {
        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new RoomNotFoundException(request.roomId()));

        seat.setRoom(room);
        seat.setSeatRow(request.seatRow());
        seat.setSeatNumber(request.seatNumber());
        seat.setSeatType(request.seatType());
    }

    private SeatResponse toResponse(Seat seat) {
        return new SeatResponse(
                seat.getSeatId(),
                seat.getSeatRow(),
                seat.getSeatNumber(),
                seat.getSeatType()
        );
    }
}