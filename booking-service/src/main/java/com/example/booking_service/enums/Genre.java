/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.booking_service.enums;

import com.example.booking_service.entity.Movie;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
 
import java.util.HashSet;
import java.util.Set;
/**
 *
 * @author quanghieu
 */
@Entity
@Table(name = "genres")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "movies")
public class Genre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "genre_id")
    private Long genreId;
 
    @Column(name = "name", nullable = false, unique = true)
    private String name;
 
    @ManyToMany(mappedBy = "genres", fetch = FetchType.LAZY)
    private Set<Movie> movies = new HashSet<>();

}