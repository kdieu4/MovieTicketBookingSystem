/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
import java.time.OffsetDateTime;
/**
 *
 * @author quanghieu
 */
@Entity
@Table(name = "cinemas")
@Getter
@Setter
@NoArgsConstructor
public class Cinema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cinema_id")
    private Long cinemaId;
 
    @Column(name = "name", nullable = false)
    private String name;
 
    @Column(name = "address", nullable = false)
    private String address;
 
    @Column(name = "city", nullable = false)
    private String city;
 
    @Column(name = "phone_number")
    private String phoneNumber;
 
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
 
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
 
    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }
 
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}