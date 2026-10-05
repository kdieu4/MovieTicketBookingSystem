/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.specification;

import com.mtbs.movie_service.domain.entity.Genre;
import com.mtbs.movie_service.domain.entity.Movie;
import com.mtbs.movie_service.domain.entity.enums.MovieStatus;

import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
/**
 *
 * @author quanghieu
 */
public class MovieSpecifications {

    private MovieSpecifications() {
    }

    public static Specification<Movie> hasStatus(MovieStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Movie> hasAnyGenre(List<Long> genreIds) {
        return (root, query, cb) -> {
            if (genreIds == null || genreIds.isEmpty()) {
                return null;
            }
            query.distinct(true);
            Join<Movie, Genre> genres = root.join("genres");
            return genres.get("genreId").in(genreIds);
        };
    }

    public static Specification<Movie> titleContains(String title) {
        return (root, query, cb) -> (title == null || title.isBlank())
                ? null
                : cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }
}