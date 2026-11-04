/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.controller;

import com.mtbs.movie_service.domain.dto.request.RoomRequest;
import com.mtbs.movie_service.domain.dto.response.RoomResponse;
import com.mtbs.movie_service.service.RoomService;

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
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/getRooms")
    public ResponseEntity<List<RoomResponse>> getRoomsByCinema(@RequestParam(required = false) Long cinemaId) {
        if (cinemaId != null) {
            return ResponseEntity.ok(roomService.getRoomsByCinemaId(cinemaId));
        }
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/getRoomById")
    public ResponseEntity<RoomResponse> getRoomById(@RequestParam Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PostMapping("/createRoom")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/updateRoom")
    public ResponseEntity<RoomResponse> updateRoom(
            @RequestParam Long id,
            @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @DeleteMapping("/deleteRoom")
    public ResponseEntity<Void> deleteRoom(@RequestParam Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}