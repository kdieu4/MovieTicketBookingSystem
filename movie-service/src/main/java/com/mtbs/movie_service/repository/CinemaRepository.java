/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.mtbs.movie_service.repository;

import com.mtbs.movie_service.domain.entity.Cinema;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
/**
 *
 * @author quanghieu
 */
@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Long> {

    boolean existsByNameAndAddress(String name, String address);

    @Query("SELECT DISTINCT c.city FROM Cinema c WHERE c.city IS NOT NULL AND c.city != '' ORDER BY c.city ASC")
    List<String> findDistinctCities();

    List<Cinema> findByCityIgnoreCase(String city);
}