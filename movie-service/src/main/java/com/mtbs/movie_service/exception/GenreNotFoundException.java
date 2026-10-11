/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.exception;

/**
 *
 * @author quanghieu
 */
public class GenreNotFoundException extends RuntimeException {

    public GenreNotFoundException(Long genreId) {
        super("Genre not found with id: " + genreId);
    }
}