/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.example.booking_service.repository;

import com.example.booking_service.enums.Genre;

import org.springframework.data.jpa.repository.JpaRepository;
/**
 *
 * @author quanghieu
 */
public interface GenreRepository extends JpaRepository<Genre, Long> {
    
}