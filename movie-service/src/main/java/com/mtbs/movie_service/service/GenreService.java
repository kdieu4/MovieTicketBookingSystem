/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.service;

import com.mtbs.movie_service.domain.dto.response.GenreResponse;

import java.util.List;
/**
 *
 * @author quanghieu
 */
public interface GenreService {

    List<GenreResponse> getAllGenres();
}