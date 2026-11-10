package com.mtbs.movie_service;

import com.mtbs.movie_service.client.TmdbClient;
import com.mtbs.movie_service.client.TmdbClient.TmdbMovie;
import com.mtbs.movie_service.client.TmdbClient.TmdbReview;
import com.mtbs.movie_service.domain.dto.response.TmdbReviewResponse;
import com.mtbs.movie_service.domain.entity.Movie;
import com.mtbs.movie_service.repository.MovieRepository;
import com.mtbs.movie_service.service.TmdbService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TmdbServiceTest {

    @Mock MovieRepository movieRepository;
    @Mock TmdbClient tmdbClient;
    @InjectMocks TmdbService tmdbService;

    private Movie movie(String title, LocalDate releaseDate) {
        Movie movie = new Movie();
        movie.setTitle(title);
        movie.setReleaseDate(releaseDate);
        return movie;
    }

    @Test
    @DisplayName("Phim chưa có tmdb_id -> tìm theo tên + năm rồi lưu điểm")
    void syncRatings_timTheoTen() {
        Movie inception = movie("Inception", LocalDate.of(2010, 7, 16));
        when(movieRepository.findAll()).thenReturn(List.of(inception));
        when(tmdbClient.findMovie("Inception", 2010))
                .thenReturn(Optional.of(new TmdbMovie(27205L, "Inception", "Inception", 8.4, 37000)));

        tmdbService.syncRatings();

        assertThat(inception.getTmdbId()).isEqualTo(27205L);
        assertThat(inception.getTmdbRating()).isEqualTo(8.4);
        assertThat(inception.getTmdbVoteCount()).isEqualTo(37000);
    }

    @Test
    @DisplayName("TMDB không tìm thấy -> giữ nguyên dữ liệu cũ")
    void syncRatings_khongTimThay_giuNguyen() {
        Movie unknown = movie("Phim Không Tồn Tại", null);
        when(movieRepository.findAll()).thenReturn(List.of(unknown));
        when(tmdbClient.findMovie("Phim Không Tồn Tại", null)).thenReturn(Optional.empty());

        tmdbService.syncRatings();

        assertThat(unknown.getTmdbId()).isNull();
        assertThat(unknown.getTmdbRating()).isNull();
    }

    @Test
    @DisplayName("Đã có tmdb_id -> làm mới điểm, và review được cache")
    void getReviews_cacheTheoPhim() {
        Movie movie = movie("Inception", LocalDate.of(2010, 7, 16));
        movie.setMovieId(1L);
        movie.setTmdbId(27205L);
        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));
        when(tmdbClient.getReviews(27205L)).thenReturn(List.of(
                new TmdbReview("an", null, "Hay", "2024-01-01T00:00:00.000Z", "https://www.themoviedb.org/review/1"),
                new TmdbReview("binh", null, "  ", "2024-01-02T00:00:00.000Z", "https://www.themoviedb.org/review/2")));

        List<TmdbReviewResponse> first = tmdbService.getReviews(1L);
        List<TmdbReviewResponse> second = tmdbService.getReviews(1L);

        assertThat(first).hasSize(1);
        assertThat(first.get(0).content()).isEqualTo("Hay");
        assertThat(second).isSameAs(first);
        verify(tmdbClient, times(1)).getReviews(27205L);
    }
}
