package com.mtbs.movie_service.domain.dto.response;

/**
 * Mot the loai kem so phim khop bo loc hien tai.
 * <p>
 * Dung cho hang chip "Loc theo the loai" o trang chu: so luong phai tinh tren
 * toan bo du lieu khop bo loc, khong phai chi tren trang dang xem.
 */
public record GenreFacetResponse(
        Long genreId,
        String name,
        long count) {

}
