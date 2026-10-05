# MTBS - User Service

Xây dựng theo issue [#3 - feature/be-user-service](https://github.com/kdieu4/MoiveTicketBookingSystem/issues/3).

> **Phạm vi tuần 2: chưa yêu cầu Authentication, JWT và Role.**
> Service này **không** có đăng nhập / đăng ký / phân quyền. Chỉ cung cấp
> `GET /api/users/{id}` để Booking Service kiểm tra người dùng trước khi tạo đặt vé.

Port: **8081**

## Đối chiếu yêu cầu issue #3

| # | Yêu cầu trong issue | Trạng thái | Nơi thực hiện |
|---|---|---|---|
| — | Khởi tạo Spring Boot project `user-service` | ✅ | `pom.xml` |
| — | Cấu hình port riêng cho service | ✅ | `application.properties` → `server.port=8081` |
| — | Tổ chức theo Layered Architecture | ✅ | xem cây thư mục bên dưới |
| B2 | `domain/entity/User.java` | ✅ | `domain/entity/User.java` |
| B2 | `domain/dto/response/UserResponse.java` | ✅ | `domain/dto/response/UserResponse.java` |
| B2 | `repository/UserRepository.java` | ✅ | `repository/UserRepository.java` |
| B2 | `service/UserService.java` | ✅ | `service/UserService.java` |
| B2 | `service/impl/UserServiceImpl.java` | ✅ | `service/impl/UserServiceImpl.java` |
| B2 | Tạo dữ liệu mẫu để kiểm thử | ✅ | `src/main/resources/data.sql` (5 user) |
| B2 | Logic tìm User theo ID | ✅ | `UserServiceImpl.getUserById()` |
| B3 | `controller/UserController.java` | ✅ | `controller/UserController.java` |
| B3 | Endpoint `GET /api/users/{id}` | ✅ | trả `200 OK` + JSON |
| B3 | User tồn tại → `200 OK` | ✅ | xem `docs/01-user-ton-tai.md` |
| B3 | User không tồn tại → `404 Not Found` | ✅ | xem `docs/02-user-khong-ton-tai.md` |
| B4 | `exception/UserNotFoundException.java` | ✅ | `exception/UserNotFoundException.java` |
| B4 | `exception/GlobalExceptionHandler.java` | ✅ | chuyển thành HTTP 404 + JSON |
| B4 | Response lỗi trả về JSON | ✅ | `{ status, error, message, timestamp }` |
| B5 | Kiểm thử user tồn tại / không tồn tại | ✅ | 12 test, `mvn test` → 12/12 pass |
| B5 | Kiểm thử bằng Postman | ✅ | `postman/MTBS-User-Service.postman_collection.json` |
| B5 | Lưu request/response phục vụ demo | ✅ | thư mục [`docs/`](docs/README.md) |

> **Ngoài phạm vi (không làm):** Authentication, JWT, Role — issue ghi rõ
> *"Trong phạm vi tuần 2 chưa yêu cầu"*.

## API

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/users/{id}` | Lấy thông tin người dùng theo ID |

| Tình huống | HTTP | Body |
|---|---|---|
| User tồn tại | `200 OK` | Thông tin user dạng JSON |
| User không tồn tại | `404 Not Found` | JSON lỗi |
| ID không phải số | `400 Bad Request` | JSON lỗi |

### Ví dụ

**User tồn tại → 200 OK**
```http
GET http://localhost:8081/api/users/1
```
```json
{
  "id": 1,
  "fullName": "Nguyen Van An",
  "email": "an.nguyen@mtbs.vn",
  "phoneNumber": "0901000001",
  "createdAt": "2026-10-03T10:00:00"
}
```

**User không tồn tại → 404 Not Found**
```http
GET http://localhost:8081/api/users/999999
```
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Khong tim thay user voi id = 999999",
  "timestamp": "2026-10-03T10:00:05"
}
```

**ID không phải số → 400 Bad Request**
```http
GET http://localhost:8081/api/users/abc
```
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "ID khong hop le",
  "timestamp": "2026-10-03T10:00:08"
}
```

## Cấu trúc project (đúng theo issue)

```
user-service/
├── .env                          # bien moi truong (KHONG commit)
├── .env.example                  # mau bien moi truong (CO commit)
├── pom.xml
├── README.md
├── postman/
│   └── MTBS-User-Service.postman_collection.json
│
└── src/
    ├── main/
    │   ├── java/com/mtbs/user_service/
    │   │   ├── UserServiceApplication.java
    │   │   ├── controller/
    │   │   │   └── UserController.java
    │   │   ├── service/
    │   │   │   ├── UserService.java
    │   │   │   └── impl/
    │   │   │       └── UserServiceImpl.java
    │   │   ├── repository/
    │   │   │   └── UserRepository.java
    │   │   ├── domain/
    │   │   │   ├── entity/
    │   │   │   │   └── User.java
    │   │   │   └── dto/
    │   │   │       ├── request/          (để trống — tuần nay không có request DTO)
    │   │   │       └── response/
    │   │   │           └── UserResponse.java
    │   │   └── exception/
    │   │       ├── UserNotFoundException.java
    │   │       └── GlobalExceptionHandler.java
    │   └── resources/
    │       ├── application.properties
    │       └── data.sql
    │
    └── test/java/com/mtbs/user_service/
        ├── UserServiceImplTest.java     # test tầng nghiệp vụ
        └── UserControllerTest.java      # test tầng HTTP
```

Luồng xử lý:

```
GET /api/users/{id}
   → UserController.getUserById()
   → UserService.getUserById()
   → UserServiceImpl.getUserById()
   → UserRepository.findById()
   → MySQL (bảng users)
```

## Kết quả kiểm thử

Xem [`docs/README.md`](docs/README.md) — chứa request / response thật lấy từ app
đang chạy cho cả 3 trường hợp, kèm kết quả `mvn test`.

## Công nghệ

Java 21 · Spring Boot 3.3.5 · Spring Web · Spring Data JPA · MySQL 8 · Lombok

## Cấu hình

Thông tin kết nối nằm trong file `.env` ở thư mục gốc project:

```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mtbs_user_service
DB_USER=mtbs_user
DB_PASSWORD=<mat_khau_cua_ban>
```

`application.properties` nạp file này qua:

```properties
spring.config.import=optional:file:.env[.properties]
```

`.env` đã nằm trong `.gitignore` nên **không bị commit** lên GitHub.

### Chạy lần đầu

```bash
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

Sau đó điền mật khẩu MySQL thật vào `.env`.

> Spring đọc `.env` theo **đường dẫn tương đối** so với thư mục làm việc hiện tại,
> nên **phải chạy lệnh dưới đây từ thư mục gốc project** (thư mục chứa file `.env`).

### Tạo database

```sql
CREATE DATABASE mtbs_user_service
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mtbs_user'@'localhost' IDENTIFIED BY '<mat_khau_cua_ban>';
GRANT ALL PRIVILEGES ON mtbs_user_service.* TO 'mtbs_user'@'localhost';
FLUSH PRIVILEGES;
```

## Chạy

```bash
# chạy từ thư mục gốc project
mvn spring-boot:run
# hoặc
mvn clean package
java -jar target/user-service-1.0.0.jar
```

## Dữ liệu mẫu

`src/main/resources/data.sql` — 5 user phục vụ kiểm thử:

| id | Họ tên | Email | Số điện thoại |
|---|---|---|---|
| 1 | Nguyen Van An | an.nguyen@mtbs.vn | 0901000001 |
| 2 | Tran Thi Bich | bich.tran@mtbs.vn | 0901000002 |
| 3 | Le Hoang Chung | chung.le@mtbs.vn | 0901000003 |
| 4 | Pham Thu Dung | dung.pham@mtbs.vn | 0901000004 |
| 5 | Vo Van Em | em.vo@mtbs.vn | 0901000005 |

Dùng `INSERT IGNORE` nên khởi động lại nhiều lần không sinh dữ liệu trùng.
Bảng được tạo tự động bởi `spring.jpa.hibernate.ddl-auto=update`; `data.sql` chạy
**sau** nhờ `spring.jpa.defer-datasource-initialization=true`.

## Kiểm thử

```bash
mvn test
```

**12 test**, chạy trên MySQL thật:

| Lớp test | Nội dung |
|---|---|
| `UserServiceImplTest` (7) | User tồn tại trả đúng thông tin · cả 5 user mẫu · user vừa thêm · ID không tồn tại → `UserNotFoundException` · exception chứa đúng id · ID âm · `UserResponse` không có trường `password` |
| `UserControllerTest` (5) | `200 OK` + JSON đúng cấu trúc · `404` + JSON lỗi · `400` khi ID không phải số · dữ liệu mẫu · JSON không chứa trường `password` |

### Kiểm thử bằng Postman

Import file `postman/MTBS-User-Service.postman_collection.json`
(Postman → Collections → Import). Collection đã lưu sẵn **request kèm response mẫu**
cho cả 3 trường hợp để phục vụ demo.

## Ghi chú thiết kế

- **Tách `User` và `UserResponse`.** DTO response cố ý không chứa các trường nhạy cảm
  (ví dụ `password`), để khi thêm tính năng đăng nhập ở các tuần sau, thông tin nhạy
  cảm không lỡ tay lọt ra ngoài API.
- **Bắt đúng class exception.** `/api/users/abc` làm Spring ném
  `MethodArgumentTypeMismatchException` chứ không phải `NumberFormatException`.
  Bắt sai class sẽ khiến request trả `500` thay vì `400`.
- **Cấu trúc JSON lỗi** dùng `Map` khai báo trong `GlobalExceptionHandler`
  thay vì tách thêm class `ErrorResponse`, cho đúng phạm vi tối thiểu của tuần này.
- **`domain/dto/request/`** được tạo theo đúng cây thư mục trong issue nhưng đang để
  trống vì tuần nay không có request DTO. Có `.gitkeep` để git giữ lại thư mục.