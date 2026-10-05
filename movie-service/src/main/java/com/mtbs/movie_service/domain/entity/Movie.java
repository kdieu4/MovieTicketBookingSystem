/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.domain.entity;

import com.mtbs.movie_service.domain.entity.enums.AgeRestriction;
import com.mtbs.movie_service.domain.entity.enums.MovieStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
 
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
/**
 *
 * @author quanghieu
 */
@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "genres")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Long movieId;
 
    @Column(name = "title", nullable = false)
    private String title;
 
    @Column(name = "description")
    private String description;
 
    @Column(name = "duration_minutes")
    private Short durationMinutes;
 
    @Column(name = "language")
    private String language;
 
    @Column(name = "release_date")
    private LocalDate releaseDate;
 
    @Column(name = "poster_url")
    private String posterUrl;
 
    @Column(name = "trailer_url")
    private String trailerUrl;
 
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "age_restriction", columnDefinition = "age_restriction_enum")
    private AgeRestriction ageRestriction;
 
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", columnDefinition = "movie_status_enum")
    private MovieStatus status;
 
    @Column(name = "director")
    private String director;
 
    @Column(name = "actors")
    private String actors;
 
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
 
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
 
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "movie_genres",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();
    
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