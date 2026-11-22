# API contract – Phần 2.2 (Tích hợp và tiêu thụ dịch vụ)

Tài liệu này chỉ mô tả các API dùng trong quy trình **đặt vé** của Bài kiểm tra 2, phần 2.2.
Toàn bộ lời gọi giữa các dịch vụ đi qua HTTP/JSON. Không dịch vụ nào đọc bảng của dịch vụ khác.

## 1. Vai trò

| Dịch vụ | Vai trò trong 2.2 | Dữ liệu sở hữu |
| --- | --- | --- |
| `booking-service` | Consumer | `booking`, `booking_seat` |
| `user-service` | Provider | `users`, hồ sơ người dùng |
| `movie-service` | Provider | `movie`, `showtime`, `showtime_seat`, `seat` |
| `api-gateway` | Cửa vào duy nhất cho client | Không sở hữu dữ liệu nghiệp vụ |
| `eureka-server` | Service Registry | Không sở hữu dữ liệu nghiệp vụ |

Quy trình: khách giữ ghế, `booking-service` kiểm tra hồ sơ người dùng và suất chiếu ở hai Provider,
giữ ghế qua API nội bộ của `movie-service`, rồi lưu đơn ở trạng thái `PENDING`.

## 2. Xác thực

| Loại lời gọi | Header | Ai kiểm tra |
| --- | --- | --- |
| Client → Gateway → dịch vụ | `Authorization: Bearer <JWT>` | `booking-service` (JWT) |
| `booking-service` → `user-service` | `X-Internal-Api-Key: <key>` | `user-service` |
| `booking-service` → `movie-service` | `X-Internal-Api-Key: <key>` | `movie-service` |

Gateway chặn path `/api/internal/**` từ bên ngoài; gọi thẳng cổng Provider mà thiếu key trả `401`.

## 3. Provider API – `movie-service`

Base URL khi chạy local: `http://localhost:8083`. Qua Gateway: `http://localhost:8080`.

### 3.1. Lấy danh sách suất chiếu

```http
GET /api/getShowtimes
```

`200 OK`

```json
[
  {
    "showtimeId": 5401,
    "movieId": 12,
    "roomId": 3,
    "startTime": "2026-11-23T19:00:00+07:00",
    "endTime": "2026-11-23T21:00:00+07:00",
    "basePrice": 90000,
    "status": "ACTIVE"
  }
]
```

### 3.2. Lấy một suất chiếu

```http
GET /api/getShowtimeById?id={showtimeId}
```

| Mã | Khi nào | Body |
| --- | --- | --- |
| `200` | Tìm thấy | `ShowtimeResponse` |
| `404` | Không có suất chiếu | `{"message": "..."}` |
| `400` | Thiếu hoặc sai kiểu `id` | `{"message": "..."}` |

### 3.3. Lấy trạng thái ghế của suất chiếu

```http
GET /api/getSeatsByShowtime?showtimeId={showtimeId}
```

`200 OK`

```json
[
  { "id": 5132, "row": "A", "number": 1, "type": "NORMAL", "isSold": false, "heldByMe": false, "holdUntil": null }
]
```

`heldByMe` phụ thuộc `sessionId` của người gọi; Consumer không dùng trường này để quyết định giữ ghế.

### 3.4. Giữ ghế tạm thời (client → Gateway → Provider)

```http
POST /api/holdSeats?showtimeId={showtimeId}
Authorization: Bearer <JWT>
Content-Type: application/json

{ "sessionId": "kt2-...", "seatIds": [5132] }
```

`200 OK`: `{ "holdUntil": "2026-11-22T20:15:00+07:00", ... }`

### 3.5. Giữ ghế cho một đơn (Consumer → Provider, API nội bộ)

```http
POST /api/internal/showtimes/{showtimeId}/seat-claims
X-Internal-Api-Key: <key>
Content-Type: application/json

{ "bookingId": 237, "sessionId": "kt2-...", "seatIds": [5132] }
```

`200 OK`

```json
{ "seatIds": [5132], "holdUntil": "2026-11-22T20:15:00+07:00", "amount": 90000 }
```

| Mã | Khi nào |
| --- | --- |
| `200` | Giữ đủ ghế, trả hạn giữ và số tiền Provider tính |
| `400` | `seatIds` rỗng, trùng, hoặc suất chiếu đã bắt đầu |
| `401` | Thiếu hoặc sai `X-Internal-Api-Key` |
| `404` | Không có suất chiếu |
| `409` | Một hoặc nhiều ghế không còn giữ được |

### 3.6. Nhả ghế khi bước sau thất bại

```http
DELETE /api/internal/showtimes/{showtimeId}/seat-claims/{bookingId}
X-Internal-Api-Key: <key>
Content-Type: application/json

[5132]
```

`204 No Content`.

## 4. Provider API – `user-service`

### 4.1. Lấy hồ sơ theo tài khoản đăng nhập

```http
GET /api/users/internal/profiles/by-auth-user/{authUserId}
X-Internal-Api-Key: <key>
```

`200 OK`: `{ "id": 47, "fullName": "...", ... }`

| Mã | Khi nào |
| --- | --- |
| `200` | Tìm thấy hồ sơ |
| `404` | Tài khoản chưa có hồ sơ |
| `401` / `403` | Sai hoặc thiếu key nội bộ |

## 5. Consumer API – `booking-service`

### 5.1. Tạo đơn đặt vé

```http
POST /api/bookings
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "userId": 47,
  "showtimeId": 5401,
  "seatIds": [5132],
  "sessionId": "kt2-...",
  "requestId": "kt2-c2-1760000000"
}
```

`201 Created`

```json
{
  "bookingId": 237,
  "userId": 47,
  "showtimeId": 5401,
  "seatIds": [5132],
  "amount": 90000,
  "status": "PENDING",
  "holdUntil": "2026-11-22T20:15:00+07:00"
}
```

`amount` và `holdUntil` là dữ liệu Provider trả về, không do `booking-service` tự tính.
`requestId` chống tạo trùng khi client gửi lại.

| Mã | Khi nào | Mã lỗi |
| --- | --- | --- |
| `201` | Tạo đơn và giữ ghế thành công | – |
| `400` | Thiếu trường, `seatIds` rỗng, sai kiểu | `INVALID_REQUEST` |
| `401` | Thiếu hoặc sai JWT | – |
| `403` | Không có quyền với tài nguyên | – |
| `404` | Provider báo không có suất chiếu / hồ sơ | `SHOWTIME_NOT_FOUND`, `USER_NOT_FOUND` |
| `409` | Ghế đã bị giữ hoặc đã bán | `SEAT_ALREADY_BOOKED` |
| `503` | Provider không kết nối được, timeout, hoặc hết instance | `SERVICE_UNAVAILABLE` |

### 5.2. Đọc lại đơn

```http
GET /api/bookings/{bookingId}
Authorization: Bearer <JWT>
```

`200 OK` trả cùng cấu trúc `BookingResponse`; `403` nếu không phải chủ đơn; `404` nếu không có đơn.

## 6. Quy tắc xử lý phía Consumer

| Tình huống | Cách phát hiện | Kết quả trả cho client |
| --- | --- | --- |
| Provider trả `404` | `HttpClientErrorException.NotFound` | `404` + mã lỗi nghiệp vụ |
| Provider không kết nối được | `ResourceAccessException` | `503 SERVICE_UNAVAILABLE` |
| Provider timeout | connect 2 giây, read 3 giây | `503 SERVICE_UNAVAILABLE` |
| Provider hết instance trong Registry | `IllegalStateException` từ LoadBalancer | `503 SERVICE_UNAVAILABLE` |
| Provider trả `409` | `HttpClientErrorException.Conflict` | `409 SEAT_ALREADY_BOOKED` |
| Dữ liệu đầu vào sai | Bean Validation | `400 INVALID_REQUEST` |
| Provider trả body thiếu trường | kiểm tra `null` sau khi gọi | `400` hoặc `503`, không lưu đơn rác |

## 7. Bất biến của quy trình

1. `booking-service` chỉ đọc/ghi bảng `booking`, `booking_seat`; không `SELECT` bảng của `movie-service` hay `user-service`.
2. Đơn chỉ được lưu khi `user-service` trả hồ sơ hợp lệ và `movie-service` xác nhận giữ đủ ghế.
3. Nếu giữ ghế xong mà bước sau lỗi, Consumer gọi API nhả ghế để bù trừ.
4. Không trả stack trace, `Connection refused`, tên lớp Java hay chi tiết database ra client.
