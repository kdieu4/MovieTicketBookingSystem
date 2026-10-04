/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.domain.entity;

import com.mtbs.movie_service.domain.entity.enums.SeatType;

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
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "room")
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long seatId;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
 
    @Column(name = "seat_row", nullable = false)
    private String seatRow;
 
    @Column(name = "seat_number", nullable = false)
    private Short seatNumber;
 
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "seat_type", columnDefinition = "seat_type_enum")
    private SeatType seatType;
 
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