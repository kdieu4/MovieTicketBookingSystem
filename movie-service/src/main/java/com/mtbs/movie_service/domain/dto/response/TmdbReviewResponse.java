package com.mtbs.movie_service.domain.dto.response;

/** Mot review lay tu TMDB, da rut gon truong khong can cho frontend. */
public record TmdbReviewResponse(
        String author,
        Double rating,
        String content,
        String createdAt,
        String url
) {
}
