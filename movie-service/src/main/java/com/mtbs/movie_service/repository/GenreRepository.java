/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.repository;

import com.mtbs.movie_service.domain.entity.Genre;

import org.springframework.data.jpa.repository.JpaRepository;
/**
 *
 * @author quanghieu
 */
public interface GenreRepository extends JpaRepository<Genre, Long> {
    
}