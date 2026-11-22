# Báo cáo phần 2.2 – Triển khai tích hợp và tiêu thụ dịch vụ

1\. Phạm vi và phần kế thừa

| Nội dung | Trạng thái | Nguồn |
| --- | --- | --- |
| Consumer gọi Provider bằng REST | Đã có từ TH6 | `BookingServiceImpl`, `MovieServiceClient`, `UserServiceClient` |
| Giữ ghế và tính tiền qua API nội bộ | Đã có từ TH6 | `MovieSeatClaimClient`, `InternalSeatClaimController` |
| Ánh xạ lỗi 404 và 503 | Đã có từ TH6, bổ sung kiểm thử | `GlobalExceptionHandler` |
| Gọi Provider bằng Service ID | Đã có từ TH7 | `RestClientConfig` với `@LoadBalanced` |
| Môi trường chạy để lấy minh chứng | Đã có từ TH8 | `docker-compose.th8.yaml` |
| Bộ kiểm thử riêng cho 2.2 | Bổ sung cho bài kiểm tra | Collection `MTBS - Kiem tra 2.2` |
| API contract cho 2.2 | Bổ sung cho bài kiểm tra | `docs/LeQuangHieu/api-contract.md` |
| Minh chứng lỗi 400 và 503 | Bổ sung cho bài kiểm tra | `docs/LeQuangHieu/testing/` |

Phần bổ sung chính là bộ kiểm thử 13 request, tài liệu hợp đồng API và minh chứng cho ba nhóm lỗi. Mã nguồn tích hợp không phải viết lại từ đầu.

## 2. Quy trình nghiệp vụ và vai trò dịch vụ

Quy trình được chọn là **đặt vé xem phim**:

1. Khách hàng chọn suất chiếu và ghế.
2. Hệ thống giữ ghế tạm thời.
3. Hệ thống tạo đơn ở trạng thái `PENDING`.
4. Đơn được lưu vào database của Booking Service.

Trong quy trình này:

| Dịch vụ | Vai trò | Dữ liệu sở hữu | API được dùng |
| --- | --- | --- | --- |
| `booking-service` | Consumer | `booking`, `booking_seat` | `POST /api/bookings`, `GET /api/bookings/{id}` |
| `user-service` | Provider | hồ sơ người dùng | `GET /api/users/internal/profiles/by-auth-user/{id}` |
| `movie-service` | Provider | phim, suất chiếu, ghế | `GET /api/getShowtimeById`, `POST /api/internal/showtimes/{id}/seat-claims` |
| `api-gateway` | Cửa vào | không sở hữu dữ liệu nghiệp vụ | route `lb://booking-service` |
| `eureka-server` | Registry | không sở hữu dữ liệu nghiệp vụ | đăng ký và khám phá |

Booking Service không có repository hay entity nào trỏ sang bảng của User Service hoặc Movie Service. Muốn kiểm tra hồ sơ, suất chiếu hay ghế, Booking Service phải gọi API.

## 3. Sơ đồ tuần tự

```
sequenceDiagram
    actor C as Khách hàng
    participant G as API Gateway
    participant B as Booking Service (Consumer)
    participant U as User Service (Provider)
    participant M as Movie Service (Provider)
    participant DB as Booking DB

    C->>G: POST /api/bookings + JWT
    G->>B: lb://booking-service
    B->>U: GET hồ sơ theo auth user
    alt Hồ sơ không tồn tại
        U-->>B: 404
        B-->>C: 404 USER_NOT_FOUND
    else Có hồ sơ
        U-->>B: 200 hồ sơ
        B->>M: GET /api/getShowtimeById
        alt Suất chiếu không tồn tại
            M-->>B: 404
            B-->>C: 404 SHOWTIME_NOT_FOUND
        else Có suất chiếu
            M-->>B: 200 suất chiếu + giá
            B->>M: POST seat-claims + X-Internal-Api-Key
            alt Ghế đã bị giữ
                M-->>B: 409
                B-->>C: 409 SEAT_ALREADY_BOOKED
            else Giữ ghế thành công
                M-->>B: 200 seatIds + holdUntil + amount
                B->>DB: Lưu booking PENDING
                B-->>C: 201 BookingResponse
            end
        end
    end
    Note over B,M: Provider không kết nối hoặc timeout → 503 SERVICE_UNAVAILABLE
```

## 4. Cơ chế giao tiếp

Hệ thống dùng **REST đồng bộ** cho quy trình đặt vé vì Consumer cần câu trả lời ngay trước khi lưu đơn:

- Chưa xác nhận được hồ sơ thì không được tạo đơn.
- Chưa giữ được ghế thì không được ghi nhận đơn.
- Giá và hạn giữ ghế phải lấy từ Movie Service, không tự tính.

Địa chỉ Provider không hardcode IP. `RestClient` dùng `@LoadBalanced`, host là Service ID (`http://movie-service`, `http://user-service`); LoadBalancer hỏi Eureka để chọn instance.

Xác thực:

- Client → Gateway: JWT trong header `Authorization`.
- Consumer → Provider: `X-Internal-Api-Key` cho API nội bộ.
- Gateway chặn `/api/internal/**` và `/api/users/internal/**` từ bên ngoài.

## 5. Hợp đồng API

Hợp đồng đầy đủ ở `docs/LeQuangHieu/api-contract.md`. Tóm tắt phần quan trọng:

| Lời gọi | Request chính | Response thành công | Lỗi cần xử lý |
| --- | --- | --- | --- |
| `POST /api/bookings` | `showtimeId`, `seatIds`, `sessionId`, `requestId` | `201`, `PENDING`, `amount`, `holdUntil` | 400, 401, 403, 404, 409, 503 |
| `GET /api/getShowtimeById` | `id` | `200` suất chiếu + `basePrice` | 400, 404 |
| `POST /api/internal/showtimes/{id}/seat-claims` | `bookingId`, `sessionId`, `seatIds` | `200` `seatIds`, `holdUntil`, `amount` | 401, 404, 409 |
| `GET /api/users/internal/profiles/by-auth-user/{id}` | `id`, key nội bộ | `200` hồ sơ | 401, 403, 404 |

## 6. Kiểm tra dữ liệu đầu vào và dữ liệu Provider trả về

**Đầu vào:**

- `CreateBookingRequest` dùng Bean Validation: `showtimeId` và `userId` không null, `seatIds` không rỗng, `sessionId` và `requestId` không rỗng.
- `seatIds` bị kiểm tra trùng ở cả Consumer và Provider.
- Thiếu hoặc sai kiểu tham số trả `400 INVALID_REQUEST` / `INVALID_PARAMETER`.

**Đầu ra từ Provider:**

| Dữ liệu | Cách kiểm tra | Nếu sai |
| --- | --- | --- |
| Hồ sơ người dùng | `id` khác null | `503`, không lưu đơn |
| Suất chiếu | `showtimeId`, `roomId`, `basePrice` khác null | `400` hoặc `503` |
| Kết quả giữ ghế | `seatIds` đủ số lượng, `amount` khác null | `503`, nhả ghế nếu đã giữ |
| Đơn sau khi lưu | `bookingId`, `status`, `amount`, `holdUntil` | Test C-02/C-03 bắt lỗi |

## 7. Xử lý lỗi tích hợp

| Tình huống | Nơi phát hiện | Cách xử lý | Kết quả |
| --- | --- | --- | --- |
| Provider trả 404 | `MovieServiceClient` / `UserServiceClient` | Bắt `HttpClientErrorException.NotFound`, đổi thành exception nghiệp vụ | `404` + mã lỗi |
| Provider không kết nối được | `RestClient` | Bắt `ResourceAccessException` | `503 SERVICE_UNAVAILABLE` |
| Provider timeout | `RestClient` | Connect timeout 2 giây, read timeout 3 giây | `503 SERVICE_UNAVAILABLE` |
| Registry không còn instance | LoadBalancer | Bắt `IllegalStateException` | `503 SERVICE_UNAVAILABLE` |
| Ghế đã bị giữ | Provider trả 409 | Bắt `HttpClientErrorException.Conflict` | `409 SEAT_ALREADY_BOOKED` |
| Đầu vào sai | Bean Validation | Chặn trước khi gọi Provider | `400 INVALID_REQUEST` |
| Lưu đơn lỗi sau khi đã giữ ghế | `BookingServiceImpl` | Gọi API nhả ghế để bù trừ | Không để ghế bị khóa |

Không response nào trả stack trace, `Connection refused`, tên lớp Java hay chi tiết database.

## 8. Minh chứng kiểm thử

| Lần chạy | Điều kiện | Request | Assertion | Lỗi |
| --- | --- | --- | --- | --- |
| Đầy đủ | Movie Service đang chạy | 13 | 35 | 0 |
| Lỗi hạ tầng | Movie Service đã dừng | 2 | 5 | 0 |

Chi tiết:

- Bảng test case: `docs/LeQuangHieu/testing/integration-test.md`
- Log chạy đầy đủ: `docs/LeQuangHieu/testing/kt2-2.2-full-run.txt`
- Log khi Provider dừng: `docs/LeQuangHieu/testing/kt2-2.2-provider-down.txt`
- Collection: `postman/collections/MTBS - Kiem tra 2.2 Tich hop va tieu thu dich vu`
- Môi trường: `postman/environments/kt2-local.environment.json`

Kết quả nổi bật:

- C-02 trả `201 PENDING`, `amount` và `holdUntil` lấy từ Movie Service.
- E-01 trả `404 SHOWTIME_NOT_FOUND`.
- E-02 trả `400 INVALID_REQUEST`.
- E-03 trả `503 SERVICE_UNAVAILABLE` trong 556 ms.

## 9. Ảnh minh chứng cần chụp

Đề yêu cầu ảnh có chú thích và giải thích kết quả. Chụp đúng bảy ảnh sau, mỗi ảnh dùng chú thích gợi ý bên dưới.

| STT | Ảnh | Chú thích nên dùng |
| --- | --- | --- |
| 1 | Postman folder `01 - Provider API movie-service` | "Bốn API Provider chạy độc lập: trả suất chiếu, trả ghế, báo 404 và chặn API nội bộ khi thiếu key." |
| 2 | Postman folder `02 - Luong tich hop thanh cong` | "Consumer đăng nhập, giữ ghế, tạo đơn 201 và đọc lại đơn; `amount` và `holdUntil` lấy từ Provider." |
| 3 | Postman folder `03 - Loi tich hop` | "Consumer trả 404 khi Provider không có suất chiếu và 400 khi dữ liệu đầu vào sai." |
| 4 | Postman E-03 sau khi dừng Movie Service | "Provider không khả dụng: Consumer trả 503 trong dưới một giây, không lộ chi tiết kỹ thuật." |
| 5 | Eureka dashboard | "Booking, User và Movie Service đã đăng ký; Consumer gọi Provider bằng Service ID." |
| 6 | `docker compose ps` | "Mười container healthy, hệ thống dùng để chạy minh chứng." |
| 7 | Terminal dừng và khởi động lại Movie Service | "Thao tác dừng Provider để kiểm thử lỗi 503 và khởi động lại để hệ thống phục hồi." |

## 10. Vấn đề phát sinh và cách xử lý

**1. Trùng cấu hình RestClient trong Booking Service.** Khi rà soát có hai lớp `RestClientConfig` ở hai package, cùng khai báo bean `restClientBuilder`. Nếu build lại, Spring Boot sẽ báo trùng bean và service không khởi động. Đã xoá bản trùng trong package `config`, giữ bản trong package `configuration`; `mvn package` chạy qua.

**2. Độ trễ của Registry khi dừng Provider.** Sau khi dừng Movie Service, Eureka và LoadBalancer cần khoảng 30–60 giây để loại instance khỏi danh sách. Vì vậy bài E-03 phải chờ trước khi chạy. Đây là hành vi đã biết của Registry, không phải lỗi cấu hình.

**3. Phân biệt lỗi nghiệp vụ và lỗi hạ tầng.** Ban đầu nếu để exception của `RestClient` thoát ra, lỗi Provider chết sẽ thành 500 và lộ chi tiết. Đã bổ sung ánh xạ: 404 giữ nguyên, 409 giữ nguyên, lỗi kết nối/timeout thành 503.

**4. Dữ liệu test cố định bị hết ghế.** Nếu dùng một `showtimeId` cố định, sau vài lần chạy ghế sẽ bị giữ. Bộ test dùng bước `SETUP-FIX-01` để chọn suất chiếu và ghế trống tại thời điểm chạy.

**5. Ghế bị giữ nhưng đơn không lưu được.** `BookingServiceImpl` đã có bù trừ: nếu đã giữ ghế mà bước sau lỗi, gọi API nhả ghế trước khi ném lỗi. Đổi lại, đây là bù trừ đơn giản, chưa phải Saga đầy đủ.

## 11. Đánh giá và hạn chế

Đã đạt:

- Provider API hoạt động độc lập và Consumer gọi được Provider.
- Quy trình đặt vé chạy xuyên suốt, dữ liệu Provider được dùng đúng.
- Xử lý ba nhóm lỗi: 404, 400, 503.
- Có API contract và minh chứng kiểm thử.
- Không truy cập trực tiếp database của Provider.

Hạn chế:

- Timeout cố định trong code, chưa cấu hình theo môi trường.
- Chưa có retry, circuit breaker hoặc bulkhead.
- Chưa kiểm thử timeout bằng một endpoint cố tình chậm; mới kiểm thử trường hợp không kết nối được.
- Bù trừ nhả ghế là xử lý cục bộ, chưa phải Saga có lưu vết.
