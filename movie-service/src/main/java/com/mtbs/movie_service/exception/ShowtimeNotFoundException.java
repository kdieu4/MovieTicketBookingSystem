/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.exception;

/**
 *
 * @author quanghieu
 */
public class ShowtimeNotFoundException extends RuntimeException {

    public ShowtimeNotFoundException(Long showtimeId) {
        super("Không tìm thấy suất chiếu với showtimeId = " + showtimeId);
    }

    public ShowtimeNotFoundException(String message) {
        super(message);
    }
}