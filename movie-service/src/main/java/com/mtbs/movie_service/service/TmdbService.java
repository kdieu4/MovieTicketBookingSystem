package com.mtbs.movie_service.service;

import com.mtbs.movie_service.client.TmdbClient;
import com.mtbs.movie_service.client.TmdbClient.TmdbMovie;
import com.mtbs.movie_service.domain.dto.response.TmdbReviewResponse;
import com.mtbs.movie_service.domain.entity.Movie;
import com.mtbs.movie_service.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Đồng bộ điểm TMDB vào bảng movies và proxy review cho trang chi tiết.
 * Review hiếm đổi nên cache 1 giờ; điểm được làm mới mỗi ngày.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TmdbService {

    private static final long REVIEW_CACHE_MS = Duration.ofHours(1).toMillis();

    private final MovieRepository movieRepository;
    private final TmdbClient tmdbClient;

    private final Map<Long, CachedReviews> reviewCache = new ConcurrentHashMap<>();

    @Scheduled(initialDelay = 2_000, fixedDelay = 24 * 60 * 60 * 1000)
    @Transactional
    public void syncRatings() {
        List<Movie> movies = movieRepository.findAll();
        if (movies.isEmpty()) {
            return;
        }

        int matched = 0;
        for (Movie movie : movies) {
            Optional<TmdbMovie> found = movie.getTmdbId() != null
                    ? tmdbClient.getMovie(movie.getTmdbId())
                    : tmdbClient.findMovie(movie.getTitle(), releaseYear(movie));

            if (found.isPresent()) {
                TmdbMovie tmdb = found.get();
                movie.setTmdbId(tmdb.id());
                movie.setTmdbRating(tmdb.voteAverage());
                movie.setTmdbVoteCount(tmdb.voteCount());
                matched++;
            }
        }
        log.info("Đồng bộ TMDB: {}/{} phim có điểm", matched, movies.size());
    }

    public List<TmdbReviewResponse> getReviews(Long movieId) {
        Movie movie = movieRepository.findById(movieId).orElse(null);
        if (movie == null || movie.getTmdbId() == null) {
            return List.of();
        }

        long now = System.currentTimeMillis();
        CachedReviews cached = reviewCache.get(movieId);
        if (cached != null && cached.expiresAt() > now) {
            return cached.reviews();
        }

        List<TmdbReviewResponse> reviews = tmdbClient.getReviews(movie.getTmdbId()).stream()
                .filter(review -> review.content() != null && !review.content().isBlank())
                .map(review -> new TmdbReviewResponse(
                        review.author(),
                        review.rating(),
                        review.content(),
                        review.createdAt(),
                        review.url()))
                .toList();

        reviewCache.put(movieId, new CachedReviews(reviews, now + REVIEW_CACHE_MS));
        return reviews;
    }

    private static Integer releaseYear(Movie movie) {
        return movie.getReleaseDate() == null ? null : movie.getReleaseDate().getYear();
    }

    private record CachedReviews(List<TmdbReviewResponse> reviews, long expiresAt) {
    }
}
