/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.domain.entity;

import com.mtbs.movie_service.domain.entity.enums.ShowtimeStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
 
import java.math.BigDecimal;
import java.time.OffsetDateTime;
/**
 *
 * @author quanghieu
 */
@Entity
@Table(name = "showtimes")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"room", "movie"})
public class Showtime {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "showtime_id")
    private Long showtimeId;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;
 
    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;
 
    @Column(name = "end_time", nullable = false)
    private OffsetDateTime endTime;
 
    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;
 
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", columnDefinition = "showtime_status_enum")
    private ShowtimeStatus status;
 
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