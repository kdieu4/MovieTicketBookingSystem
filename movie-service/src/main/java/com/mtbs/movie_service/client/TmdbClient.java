package com.mtbs.movie_service.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Gọi TMDB API để lấy điểm và review phim.
 * Token đọc từ biến môi trường (file .env), không bao giờ trả về client.
 */
@Component
@Slf4j
public class TmdbClient {

    private static final String BASE_URL = "https://api.themoviedb.org/3";

    private final RestClient restClient;
    private final String language;
    private final boolean enabled;

    public TmdbClient(@Value("${tmdb.token:}") String token,
                      @Value("${tmdb.language:vi-VN}") String language) {
        this.enabled = token != null && !token.isBlank();
        this.language = language;
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        if (!enabled) {
            log.warn("Chưa cấu hình TMDB_TOKEN - điểm và review phim sẽ để trống");
        }
    }

    /** Tìm phim theo tên + năm khởi chiếu, lấy kết quả đầu tiên. */
    public Optional<TmdbMovie> findMovie(String title, Integer year) {
        if (!enabled || title == null || title.isBlank()) {
            return Optional.empty();
        }
        try {
            TmdbSearchResult result = restClient.get()
                    .uri(builder -> builder.path("/search/movie")
                            .queryParam("query", title)
                            .queryParam("language", language)
                            .queryParamIfPresent("primary_release_year", Optional.ofNullable(year))
                            .build())
                    .retrieve()
                    .body(TmdbSearchResult.class);

            if (result == null || result.results() == null || result.results().isEmpty()) {
                return Optional.empty();
            }

            // Kết quả đầu tiên thường là phim phụ (TV special, short) nên phải chọn theo tên.
            return pickBest(result.results(), title);
        } catch (RestClientException ex) {
            log.warn("TMDB không tìm được '{}': {}", title, ex.getMessage());
            return Optional.empty();
        }
    }

    /** Ưu tiên phim có tên trùng, trong nhóm đó lấy phim nhiều lượt đánh giá nhất. */
    static Optional<TmdbMovie> pickBest(List<TmdbMovie> results, String title) {
        if (results == null || results.isEmpty()) {
            return Optional.empty();
        }

        String wanted = normalize(title);
        return results.stream()
                .filter(movie -> wanted.equals(normalize(movie.originalTitle()))
                        || wanted.equals(normalize(movie.title())))
                .max(Comparator.comparingInt(TmdbClient::votes))
                .or(() -> results.stream().max(Comparator.comparingInt(TmdbClient::votes)));
    }

    private static int votes(TmdbMovie movie) {
        return movie.voteCount() == null ? 0 : movie.voteCount();
    }

    private static String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}]", "");
    }

    /** Điểm mới nhất của một phim đã có tmdb_id. */
    public Optional<TmdbMovie> getMovie(Long tmdbId) {
        if (!enabled || tmdbId == null) {
            return Optional.empty();
        }
        try {
            return Optional.ofNullable(restClient.get()
                    .uri(builder -> builder.path("/movie/{id}")
                            .queryParam("language", language)
                            .build(tmdbId))
                    .retrieve()
                    .body(TmdbMovie.class));
        } catch (RestClientException ex) {
            log.warn("TMDB không lấy được phim {}: {}", tmdbId, ex.getMessage());
            return Optional.empty();
        }
    }

    public List<TmdbReview> getReviews(Long tmdbId) {
        if (!enabled || tmdbId == null) {
            return List.of();
        }
        try {
            TmdbReviewResult result = restClient.get()
                    .uri("/movie/{id}/reviews", tmdbId)
                    .retrieve()
                    .body(TmdbReviewResult.class);

            return result == null || result.results() == null ? List.of() : result.results();
        } catch (RestClientException ex) {
            log.warn("TMDB không lấy được review phim {}: {}", tmdbId, ex.getMessage());
            return List.of();
        }
    }

    public record TmdbMovie(
            @JsonProperty("id") long id,
            @JsonProperty("title") String title,
            @JsonProperty("original_title") String originalTitle,
            @JsonProperty("vote_average") Double voteAverage,
            @JsonProperty("vote_count") Integer voteCount
    ) {
    }

    public record TmdbReview(
            @JsonProperty("author") String author,
            @JsonProperty("author_details") AuthorDetails authorDetails,
            @JsonProperty("content") String content,
            @JsonProperty("created_at") String createdAt,
            @JsonProperty("url") String url
    ) {
        public Double rating() {
            return authorDetails == null ? null : authorDetails.rating();
        }
    }

    public record AuthorDetails(@JsonProperty("rating") Double rating) {
    }

    private record TmdbSearchResult(List<TmdbMovie> results) {
    }

    private record TmdbReviewResult(List<TmdbReview> results) {
    }
}
