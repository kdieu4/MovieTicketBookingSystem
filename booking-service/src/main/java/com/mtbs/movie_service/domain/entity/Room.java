/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
 
import java.time.OffsetDateTime;
/**
 *
 * @author quanghieu
 */
@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "cinema")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;
 
    @Column(name = "name", nullable = false)
    private String name;
 
    @Column(name = "total_seats")
    private Short totalSeats;
 
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "room_type", columnDefinition = "room_type_enum")
    private String roomType;
 
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