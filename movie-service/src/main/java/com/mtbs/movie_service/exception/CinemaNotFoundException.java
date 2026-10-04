/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.exception;

/**
 *
 * @author quanghieu
 */
public class CinemaNotFoundException extends RuntimeException {

    public CinemaNotFoundException(Long cinemaId) {
        super("Không tìm thấy rạp với cinemaId = " + cinemaId);
    }

    public CinemaNotFoundException(String message) {
        super(message);
    }
}
