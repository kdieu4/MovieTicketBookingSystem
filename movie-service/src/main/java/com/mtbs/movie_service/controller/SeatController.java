/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.request.SeatRequest;
import com.mtbs.movie_service.domain.dto.response.SeatResponse;
import com.mtbs.movie_service.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
/**
 *
 * @author quanghieu
 */
@RestController
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/api/rooms/{roomId}/seats")
    public ResponseEntity<List<SeatResponse>> getSeatsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(seatService.getSeatsByRoomId(roomId));
    }

    @GetMapping("/api/seats/{id}")
    public ResponseEntity<SeatResponse> getSeatById(@PathVariable Long id) {
        return ResponseEntity.ok(seatService.getSeatById(id));
    }

    @PostMapping("/api/seats")
    public ResponseEntity<SeatResponse> createSeat(@Valid @RequestBody SeatRequest request) {
        SeatResponse response = seatService.createSeat(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/seats/{id}")
    public ResponseEntity<SeatResponse> updateSeat(
            @PathVariable Long id, @Valid @RequestBody SeatRequest request) {
        return ResponseEntity.ok(seatService.updateSeat(id, request));
    }

    @DeleteMapping("/api/seats/{id}")
    public ResponseEntity<Void> deleteSeat(@PathVariable Long id) {
        seatService.deleteSeat(id);
        return ResponseEntity.noContent().build();
    }
}