/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.exception;
/**
 *
 * @author quanghieu
 */
public class MovieNotFoundException extends RuntimeException {
 
    public MovieNotFoundException(Long movieId) {
        super("Không tìm thấy phim với movieId = " + movieId);
    }
 
    public MovieNotFoundException(String message) {
        super(message);
    }
}