# Minh chứng kiểm thử tích hợp – Phần 2.2

- Ngày chạy: 22/11/2026
- Môi trường: Docker Compose `docker-compose.th8.yaml`, 10 container `healthy`
- Collection: `postman/collections/MTBS - Kiem tra 2.2 Tich hop va tieu thu dich vu`
- Environment: `postman/environments/kt2-local.environment.json`
- Lệnh chạy:

  ```bash
  postman collection run "postman/collections/MTBS - Kiem tra 2.2 Tich hop va tieu thu dich vu" \
    -e postman/environments/kt2-local.environment.json
  ```

- Kết quả chạy đầy đủ: `docs/LeQuangHieu/testing/kt2-2.2-full-run.txt`
- Kết quả chạy khi Provider dừng: `docs/LeQuangHieu/testing/kt2-2.2-provider-down.txt`

## 1. Kết quả tổng hợp

| Lần chạy | Điều kiện | Request | Assertion | Lỗi |
| --- | --- | --- | --- | --- |
| Đầy đủ | Movie Service đang chạy | 13 | 35 | 0 |
| Lỗi hạ tầng | Movie Service đã dừng, chạy `SETUP-01` + `E-03` | 2 | 5 | 0 |

Lint collection:

```text
No issues found.
Scanned: 13 | Errors: 0 | Warnings: 0
```

`E-03` tự bỏ qua trong lần chạy đầy đủ vì Movie Service còn sống. Đây là thiết kế có chủ ý để bộ kiểm thử không báo đỏ giả; bằng chứng 503 là lần chạy riêng khi đã dừng Provider.

## 2. Bảng test case

### Folder 01 – Provider API movie-service

| ID | Request | Kỳ vọng | Kết quả thực tế | Đạt |
| --- | --- | --- | --- | --- |
| P-01 | `GET /api/getShowtimes` | 200, mảng suất chiếu có `showtimeId`, `movieId`, `basePrice` | 200, đúng cấu trúc | Có |
| P-02 | `GET /api/getSeatsByShowtime` | 200, mảng ghế có `id`, `isSold` | 200, đúng cấu trúc | Có |
| P-03 | `GET /api/getShowtimeById?id=99999999` | 404, không lộ stack trace | 404, body không có `java.` | Có |
| P-04 | `POST /api/internal/showtimes/{id}/seat-claims` thiếu key | 401, không lộ nội bộ | 401, body không có `stackTrace` | Có |

### Folder 02 – Luồng tích hợp thành công

| ID | Request | Kỳ vọng | Kết quả thực tế | Đạt |
| --- | --- | --- | --- | --- |
| SETUP-01 | `POST /auth/login` | 200, có `accessToken` | 200, token hợp lệ | Có |
| SETUP-FIX-01 | `GET /api/getShowtimes` + chọn ghế | Tìm được suất chiếu và ghế trống | Chọn được suất và ghế | Có |
| C-01 | `POST /api/holdSeats` | 200, có `holdUntil` | 200, có `holdUntil` | Có |
| C-02 | `POST /api/bookings` | 201, `PENDING`, đúng `showtimeId`, `seatIds`, `amount` > 0, có `holdUntil` | 201, đủ các trường | Có |
| C-03 | `GET /api/bookings/{id}` | 200, đúng `bookingId`, vẫn `PENDING`, tiền không đổi | 200, dữ liệu khớp | Có |

### Folder 03 – Lỗi tích hợp

| ID | Request | Kỳ vọng | Kết quả thực tế | Đạt |
| --- | --- | --- | --- | --- |
| SETUP-01 | `POST /auth/login` | 200, có token | 200 | Có |
| E-01 | `POST /api/bookings` với `showtimeId` không tồn tại | 404 `SHOWTIME_NOT_FOUND`, không lộ chi tiết | 404, đúng mã lỗi | Có |
| E-02 | `POST /api/bookings` với `seatIds` rỗng | 400 `INVALID_REQUEST` | 400, đúng mã lỗi | Có |
| E-03 | `POST /api/bookings` khi Movie Service đã dừng | 503 `SERVICE_UNAVAILABLE`, không lộ chi tiết | 503 trong 556 ms, đúng mã lỗi | Có |

## 3. Cách tái hiện bằng chứng 503

```bash
docker compose -f docker-compose.th8.yaml stop movie-service movie-service-2
# chờ khoảng 45 giây để Eureka và LoadBalancer cập nhật
postman collection run "postman/collections/MTBS - Kiem tra 2.2 Tich hop va tieu thu dich vu" \
  -e postman/environments/kt2-local.environment.json \
  -i "03 - Loi tich hop/SETUP-01 Đăng nhập CUSTOMER" \
  -i "03 - Loi tich hop/E-03 Provider không khả dụng - 503 (chạy khi tắt movie-service)"
docker compose -f docker-compose.th8.yaml start movie-service movie-service-2
```

## 4. Nhận xét

- Provider chạy độc lập được: folder 01 gọi thẳng cổng 8083, không cần Consumer.
- Consumer dùng đúng dữ liệu Provider: `amount` và `holdUntil` trong đơn đến từ Movie Service.
- Ba nhóm lỗi được phân biệt bằng mã HTTP: 404 nghiệp vụ, 400 dữ liệu đầu vào, 503 hạ tầng.
- Không có response nào chứa stack trace, `Connection refused` hay tên lớp Java.
- Hạn chế: chưa kiểm thử timeout bằng một endpoint cố tình chậm; timeout được cấu hình 2 giây kết nối và 3 giây đọc, còn trường hợp không kết nối được đã được chứng minh bằng E-03.
