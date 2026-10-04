/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.exception;

/**
 *
 * @author quanghieu
 */
public class SeatNotFoundException extends RuntimeException {

    public SeatNotFoundException(Long seatId) {
        super("Không tìm thấy ghế với seatId = " + seatId);
    }

    public SeatNotFoundException(String message) {
        super(message);
    }
}