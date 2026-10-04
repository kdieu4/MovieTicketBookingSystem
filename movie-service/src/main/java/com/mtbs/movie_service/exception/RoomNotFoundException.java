/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.exception;

/**
 *
 * @author quanghieu
 */
public class RoomNotFoundException extends RuntimeException {

    public RoomNotFoundException(Long roomId) {
        super("Không tìm thấy phòng chiếu với roomId = " + roomId);
    }

    public RoomNotFoundException(String message) {
        super(message);
    }
}