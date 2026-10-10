package com.mtbs.user_service;

import com.jayway.jsonpath.JsonPath;
import com.mtbs.user_service.domain.entity.User;
import com.mtbs.user_service.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Kiem thu tang HTTP - endpoint GET /api/users/{id}, GET /api/users,
 * PUT /api/users/{id}, DELETE /api/users/{id}.
 * <p>
 * Chay tren MySQL that nen dung du lieu mau trong data.sql.
 * {@code @Transactional} khoan moi test se rollback sau khi xong, nen cac
 * test PUT/DELETE khong lam bay du lieu mau cho may dev.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;

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

    // ---------------- Loi HTTP chuan cua Spring: phai tra dung ma, khong phai 500 ----------------

    @Test
    @DisplayName("Duong dan khong ton tai -> 404 (khong phai 500)")
    void duongDanKhongTonTai_traVe404() throws Exception {
        mockMvc.perform(get("/khong-ton-tai"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("Duong dan co duoi .html khong ton tai -> 404")
    void duongDanCoDauChamHtml_khongTonTai_traVe404() throws Exception {
        // Truoc day ham nay tra 500 do bi handler Exception.class bat mat.
        mockMvc.perform(get("/khong-ton-tai/abc.html"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Sai HTTP method -> 405 Method Not Allowed (khong phai 500)")
    void saiHttpMethod_traVe405() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/users/{id}", 1L))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405))
                .andExpect(jsonPath("$.error").value("Method Not Allowed"));
    }

    // ---------------- GET /api/users co phan trang ----------------

    @Test
    @DisplayName("GET /api/users - mac dinh size=10 -> 200 + du lieu phan trang")
    void getUsers_macDinh_traVe200() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").isNumber())
                .andExpect(jsonPath("$.totalPages").isNumber())
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").exists())
                .andExpect(jsonPath("$.empty").exists());
    }

    @Test
    @DisplayName("GET /api/users?page=0&size=2 - tra ve dung so ban ghi")
    void getUsers_tuyChonSizeVaPage() throws Exception {
        mockMvc.perform(get("/api/users").param("page", "0").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].id").isNumber())
                .andExpect(jsonPath("$.content[0].password").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/users?page=1&size=2 - trang 2 khong trung ban ghi voi trang 1")
    void getUsers_trangThuHai_khongTrungBanGhi() throws Exception {
        String page0 = mockMvc.perform(get("/api/users").param("page", "0").param("size", "2"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String page1 = mockMvc.perform(get("/api/users").param("page", "1").param("size", "2"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        int idTrang0 = JsonPath.read(page0, "$.content[0].id");
        int idTrang1 = JsonPath.read(page1, "$.content[0].id");

        // Neu khong gan sort mac dinh, MySQL co the tra trung ban ghi giua 2 trang
        org.assertj.core.api.Assertions.assertThat(idTrang1)
                .as("Trang 2 phai bat dau bang ban ghi khac trang 1")
                .isNotEqualTo(idTrang0);
    }

    @Test
    @DisplayName("GET /api/users?sort=fullName,desc - sap xep theo yeu cau")
    void getUsers_sapXepTheoYeuCau() throws Exception {
        mockMvc.perform(get("/api/users").param("sort", "fullName,desc").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.content[0].fullName").value("Vo Van Em"));
    }

    @Test
    @DisplayName("GET /api/users?page=999 - vuot du lieu -> 200 + empty=true")
    void getUsers_vuotQaDuLieu_traVeEmpty() throws Exception {
        mockMvc.perform(get("/api/users").param("page", "999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.empty").value(true))
                .andExpect(jsonPath("$.content.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/users?size=abc - Spring fallback ve size mac dinh, khong loi")
    void getUsers_sizeKhongHopLe_fallbackVeMacDinh() throws Exception {
        // Spring Data khong nem loi khi tham so page/size khong parse duoc,
        // ma bo qua tham so do va dung gia tri mac dinh.
        // Test nay khoa lai hanh vi that de biet khi nao framework doi.
        mockMvc.perform(get("/api/users").param("size", "abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    @DisplayName("GET /api/users?sort=truongSai - loi 400 vi truong sap xep khong ton tai")
    void getUsers_sortTruongSai_traVe400() throws Exception {
        mockMvc.perform(get("/api/users").param("sort", "khongCoTrenBang,asc"))
                .andExpect(status().isBadRequest());
    }

    // ================= PUT /api/users/{id} =================

    @Test
    @DisplayName("PUT /api/users/1 - du lieu hop le -> 200 + user da cap nhat")
    void updateUser_duLieuHopLe_traVe200VaDaCapNhat() throws Exception {
        mockMvc.perform(put("/api/users/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Nguyen Van An Updated",
                                  "email": "an.updated@mtbs.vn",
                                  "phoneNumber": "0901009999"
                                }"""))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.fullName").value("Nguyen Van An Updated"))
                .andExpect(jsonPath("$.email").value("an.updated@mtbs.vn"))
                .andExpect(jsonPath("$.phoneNumber").value("0901009999"))
                .andExpect(jsonPath("$.updatedAt").exists());

        // Xac nhan thay doi that su da ghi xuong DB chu khong chi doi tren RAM
        mockMvc.perform(get("/api/users/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Nguyen Van An Updated"));
    }

    @Test
    @DisplayName("PUT - updatedAt tra ve trong response phai la moi nhat, khong phai gia tri cu")
    void updateUser_updatedAtTrongResponseLaMoiNhat() throws Exception {
        // @UpdateTimestamp chi duoc gan luc Hibernate flush xuong DB.
        // Neu service dung save() thay vi saveAndFlush(), response tra ve
        // updatedAt cu va client nhan gia tri sai ngay sau khi cap nhat.
        mockMvc.perform(put("/api/users/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Nguyen Van An",
                                  "email": "an.nguyen@mtbs.vn",
                                  "phoneNumber": "0901000001"
                                }"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.updatedAt").exists())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    LocalDateTime inResponse = LocalDateTime.parse(
                            (String) JsonPath.read(json, "$.updatedAt"));
                    LocalDateTime trongDb = userRepository.findById(1L).orElseThrow().getUpdatedAt();

                    assertThat(inResponse).isEqualTo(trongDb);
                });
    }

    @Test
    @DisplayName("PUT /api/users/1 - giu nguyen email cua chinh minh -> 200 (khong bao trung)")
    void updateUser_giuNguyenEmailCuaChinhMinh_traVe200() throws Exception {
        // Khoang cach "AndIdNot" trong existsByEmailAndIdNot dung de tranh bao
        // trung nham khi sua user ma khong doi email.
        mockMvc.perform(put("/api/users/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Nguyen Van An",
                                  "email": "an.nguyen@mtbs.vn",
                                  "phoneNumber": "0901000001"
                                }"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("an.nguyen@mtbs.vn"));
    }

    @Test
    @DisplayName("PUT /api/users/{id} - email dang thuoc user khac -> 409 Conflict")
    void updateUser_emailTrungVoUserKhac_traVe409() throws Exception {
        mockMvc.perform(put("/api/users/{id}", 2L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Tran Thi Bich",
                                  "email": "an.nguyen@mtbs.vn",
                                  "phoneNumber": "0901000002"
                                }"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("an.nguyen@mtbs.vn")));
    }

    @Test
    @DisplayName("PUT /api/users/{id} - so dien thoai dang thuoc user khac -> 409 Conflict")
    void updateUser_sdtTrungVoUserKhac_traVe409() throws Exception {
        mockMvc.perform(put("/api/users/{id}", 2L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Tran Thi Bich",
                                  "email": "bich.tran@mtbs.vn",
                                  "phoneNumber": "0901000001"
                                }"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("PUT /api/users/999999 - user khong ton tai -> 404")
    void updateUser_userKhongTonTai_traVe404() throws Exception {
        mockMvc.perform(put("/api/users/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Ai Do",
                                  "email": "aid@mtbs.vn",
                                  "phoneNumber": "0912000000"
                                }"""))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("PUT - thieu ho ten -> 400 + fieldErrors.ho ten")
    void updateUser_thieuFullName_traVe400VaChiTenTruong() throws Exception {
        mockMvc.perform(put("/api/users/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "an.nguyen@mtbs.vn",
                                  "phoneNumber": "0901000001"
                                }"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.fullName").exists());
    }

    @Test
    @DisplayName("PUT - email sai dinh dang -> 400 + fieldErrors.email")
    void updateUser_emailSaiDinhDang_traVe400() throws Exception {
        mockMvc.perform(put("/api/users/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Nguyen Van An",
                                  "email": "khong-phai-email",
                                  "phoneNumber": "0901000001"
                                }"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    @DisplayName("PUT - so dien thoai sai dinh dang -> 400 + fieldErrors.phoneNumber")
    void updateUser_sdtSaiDinhDang_traVe400() throws Exception {
        mockMvc.perform(put("/api/users/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Nguyen Van An",
                                  "email": "an.nguyen@mtbs.vn",
                                  "phoneNumber": "12345"
                                }"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.phoneNumber").exists());
    }

    @Test
    @DisplayName("PUT - body khong phai JSON hop le -> 400 (khong phai 500)")
    void updateUser_bodyKhongHopLe_traVe400() throws Exception {
        mockMvc.perform(put("/api/users/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ fullName: "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("PUT - thieu body -> 400 (khong phai 500)")
    void updateUser_thieuBody_traVe400() throws Exception {
        mockMvc.perform(put("/api/users/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/users/abc - ID khong phai so -> 400")
    void updateUser_idKhongHopLe_traVe400() throws Exception {
        mockMvc.perform(put("/api/users/{id}", "abc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Ai Do",
                                  "email": "aid@mtbs.vn",
                                  "phoneNumber": "0912000000"
                                }"""))
                .andExpect(status().isBadRequest());
    }

    // ================= DELETE /api/users/{id} =================

    /**
     * Tao mot user rieng cho test xoa.
     * <p>
     * Khong nen hardcode id vi du lieu mau co the thay doi giua cac lan chay
     * (them, xoa). Tu tao user dam bao test luon chay duoc.
     */
    private long taoUserChoTestXoa(String ten) {
        long id = userRepository.save(User.builder()
                .fullName(ten)
                .email("xoa." + System.nanoTime() + "@mtbs.vn")
                .phoneNumber("09" + (int) (Math.random() * 89999999 + 10000000))
                .build()).getId();

        assertThat(id).isPositive();
        return id;
    }

    @Test
    @DisplayName("DELETE /api/users/{id} - user ton tai -> 204 No Content, body rong")
    void deleteUser_userTonTai_traVe204() throws Exception {
        long id = taoUserChoTestXoa("Can Xoa");

        mockMvc.perform(delete("/api/users/{id}", id))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
    }

    @Test
    @DisplayName("DELETE /api/users/{id} - sau khi xoa thi GET tra 404")
    void deleteUser_sauKhiXoa_getTra404() throws Exception {
        long id = taoUserChoTestXoa("Can Xoa Roi");

        mockMvc.perform(delete("/api/users/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/users/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/users/{id} - xoa 2 lan, lan 2 tra 404")
    void deleteUser_xoaHaiLan_lanHaiTra404() throws Exception {
        long id = taoUserChoTestXoa("Xoa Hai Lan");

        mockMvc.perform(delete("/api/users/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/users/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("DELETE /api/users/{id} - danh sach phan trang khong con user da xoa")
    void deleteUser_danhSachKhongConUserDaXoa() throws Exception {
        long id = taoUserChoTestXoa("Xoa Khoi Danh Sach");

        String jsonTruoc = mockMvc.perform(get("/api/users").param("size", "1"))
                .andReturn().getResponse().getContentAsString();
        long tongTruoc = ((Number) JsonPath.read(jsonTruoc, "$.totalElements")).longValue();

        mockMvc.perform(delete("/api/users/{id}", id))
                .andExpect(status().isNoContent());

        String jsonSau = mockMvc.perform(get("/api/users").param("size", "1"))
                .andReturn().getResponse().getContentAsString();
        long tongSau = ((Number) JsonPath.read(jsonSau, "$.totalElements")).longValue();

        assertThat(tongSau).isEqualTo(tongTruoc - 1);
    }

    @Test
    @DisplayName("DELETE /api/users/999999 - user khong ton tai -> 404")
    void deleteUser_userKhongTonTai_traVe404() throws Exception {
        mockMvc.perform(delete("/api/users/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("DELETE /api/users/abc - ID khong phai so -> 400")
    void deleteUser_idKhongHopLe_traVe400() throws Exception {
        mockMvc.perform(delete("/api/users/{id}", "abc"))
                .andExpect(status().isBadRequest());
    }
}