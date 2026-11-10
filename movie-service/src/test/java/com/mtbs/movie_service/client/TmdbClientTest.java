package com.mtbs.movie_service.client;

import com.mtbs.movie_service.client.TmdbClient.TmdbMovie;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TmdbClientTest {

    @Test
    @DisplayName("Tên trùng khớp được ưu tiên hơn phim phụ nhiều lượt hơn")
    void pickBest_uuTienTenTrungKhop() {
        TmdbMovie special = new TmdbMovie(1L, "Spirited Away Special", "Spirited Away Special", 7.0, 5000);
        TmdbMovie real = new TmdbMovie(2L, "Spirited Away", "千と千尋の神隠し", 8.6, 15000);

        assertThat(TmdbClient.pickBest(List.of(special, real), "Spirited Away")).contains(real);
    }

    @Test
    @DisplayName("Không tên nào trùng thì lấy phim nhiều lượt đánh giá nhất")
    void pickBest_khongTrungTen_layPhoBienNhat() {
        TmdbMovie wrong = new TmdbMovie(1L, "What's Your Name?", "What's Your Name?", 5.1, 20);
        TmdbMovie real = new TmdbMovie(2L, "Your Name.", "君の名は。", 8.5, 11000);

        assertThat(TmdbClient.pickBest(List.of(wrong, real), "Your Name.")).contains(real);
    }

    @Test
    @DisplayName("So tên bỏ qua dấu câu: WALL-E khớp WALL·E")
    void pickBest_boQuaDauCau() {
        TmdbMovie short_ = new TmdbMovie(1L, "WALL·E's Treasures & Trinkets", "WALL·E's Treasures & Trinkets", 6.0, 300);
        TmdbMovie real = new TmdbMovie(2L, "WALL·E", "WALL·E", 8.1, 18000);

        assertThat(TmdbClient.pickBest(List.of(short_, real), "WALL-E")).contains(real);
    }
}
