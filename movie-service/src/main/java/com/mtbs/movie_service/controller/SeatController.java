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
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/getSeatsByRoomId")
    public ResponseEntity<List<SeatResponse>> getSeatsByRoom(@RequestParam Long roomId) {
        return ResponseEntity.ok(seatService.getSeatsByRoomId(roomId));
    }

    @GetMapping("/getSeatById")
    public ResponseEntity<SeatResponse> getSeatById(@RequestParam Long seatId) {
        return ResponseEntity.ok(seatService.getSeatById(seatId));
    }

    @PostMapping("/createSeat")
    public ResponseEntity<SeatResponse> createSeat(@Valid @RequestBody SeatRequest request) {
        SeatResponse response = seatService.createSeat(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/updateSeat")
    public ResponseEntity<SeatResponse> updateSeat(
            @RequestParam Long seatId,
            @Valid @RequestBody SeatRequest request) {
        return ResponseEntity.ok(seatService.updateSeat(seatId, request));
    }

    @DeleteMapping("/deleteSeat")
    public ResponseEntity<Void> deleteSeat(@RequestParam Long seatId) {
        seatService.deleteSeat(seatId);
        return ResponseEntity.noContent().build();
    }
}