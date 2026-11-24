package com.mtbs.movie_service.domain.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Mot trang phim kem thong tin bo loc.
 * <p>
 * Ngoai du lieu cua trang, tra them {@code genreFacets} de giao dien ve duoc
 * hang chip the loai voi so phim dung tren toan bo ket qua loc, khong phu thuoc
 * trang dang tai.
 */
public record MoviePageResponse(
        List<MovieResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last,
        boolean empty,
        List<GenreFacetResponse> genreFacets) {

    public static MoviePageResponse from(Page<MovieResponse> page, List<GenreFacetResponse> genreFacets) {
        return new MoviePageResponse(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.isEmpty(),
                genreFacets);
    }
}
