package com.mtbs.user_service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Kiem thu tang HTTP - endpoint GET /api/users/{id}. */
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired MockMvc mockMvc;

    // ---------------- User TON TAI -> 200 OK ----------------

    @Test
    @DisplayName("GET /api/users/1 - User ton tai -> 200 OK + JSON thong tin user")
    void getUserById_userTonTai_traVe200VaJson() throws Exception {
        mockMvc.perform(get("/api/users/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.fullName").value("Nguyen Van An"))
                .andExpect(jsonPath("$.email").value("an.nguyen@mtbs.vn"))
                .andExpect(jsonPath("$.phoneNumber").value("0901000001"))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    @DisplayName("GET /api/users/2..5 - du lieu mau tra ve dung")
    void getUserById_duLieuMau() throws Exception {
        mockMvc.perform(get("/api/users/{id}", 2L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("bich.tran@mtbs.vn"));

        mockMvc.perform(get("/api/users/{id}", 5L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("em.vo@mtbs.vn"));
    }

    @Test
    @DisplayName("GET /api/users/{id} - JSON khong chua truong password")
    void getUserById_khongCoTruongPassword() throws Exception {
        String json = mockMvc.perform(get("/api/users/{id}", 1L))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(json).doesNotContain("password");
    }

    // ---------------- User KHONG TON TAI -> 404 ----------------

    @Test
    @DisplayName("GET /api/users/999999 - User khong ton tai -> 404 Not Found + JSON loi")
    void getUserById_userKhongTonTai_traVe404() throws Exception {
        mockMvc.perform(get("/api/users/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message", containsString("999999")))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    // ---------------- ID KHONG HOP LE -> 400 ----------------

    @Test
    @DisplayName("GET /api/users/abc - ID khong phai so -> 400 Bad Request")
    void getUserById_idKhongHopLe_traVe400() throws Exception {
        mockMvc.perform(get("/api/users/{id}", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("ID khong hop le"));
    }
}