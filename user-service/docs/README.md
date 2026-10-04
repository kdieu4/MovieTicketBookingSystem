# Kết quả kiểm thử API — User Service

Tài liệu này lưu lại **request / response thật** lấy từ app đang chạy, phục vụ demo
và đối chiếu với yêu cầu kiểm thử trong
[issue #3](https://github.com/kdieu4/MoiveTicketBookingSystem/issues/3).

- Server: `http://localhost:8081`
- Ngày chạy: 03/10/2026
- Collection Postman: `postman/MTBS-User-Service.postman_collection.json`

---

## 1. Kiểm thử: User tồn tại → 200 OK

Yêu cầu trong issue: *"User tồn tại → trả 200 OK"*.

**Request**
```http
GET http://localhost:8081/api/users/1
```

**Response — HTTP 200**
```json
{
  "id": 1,
  "fullName": "Nguyen Van An",
  "email": "an.nguyen@mtbs.vn",
  "phoneNumber": "0901000001",
  "createdAt": "2026-10-03T09:48:18"
}
```

File chi tiết: [`docs/01-user-ton-tai.md`](01-user-ton-tai.md)

---

## 2. Kiểm thử: User không tồn tại → 404 Not Found

Yêu cầu trong issue: *"User không tồn tại → trả 404 Not Found"*.

**Request**
```http
GET http://localhost:8081/api/users/999999
```

**Response — HTTP 404**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Khong tim thay user voi id = 999999",
  "timestamp": "2026-10-03T11:07:34.291"
}
```

File chi tiết: [`docs/02-user-khong-ton-tai.md`](02-user-khong-ton-tai.md)

---

## 3. Kiểm thử: ID không hợp lệ → 400 Bad Request

**Request**
```http
GET http://localhost:8081/api/users/abc
```

**Response — HTTP 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "ID khong hop le",
  "timestamp": "2026-10-03T11:07:34.404"
}
```

File chi tiết: [`docs/03-id-khong-hop-le.md`](03-id-khong-hop-le.md)

---

## 4. Kiểm thử tự động

```bash
mvn test
```

**Kết quả: 12/12 pass**

| Lớp test | Số test | Nội dung |
|---|---|---|
| `UserServiceImplTest` | 7 | User tồn tại trả đúng thông tin · cả 5 user trong `data.sql` · user vừa thêm vào DB · ID không tồn tại → `UserNotFoundException` · exception chứa đúng id · ID âm · `UserResponse` không có trường `password` |
| `UserControllerTest` | 5 | `200 OK` + JSON đúng cấu trúc · `404` + JSON lỗi · `400` khi ID không phải số · dữ liệu mẫu trả đúng · JSON không chứa trường `password` |

Tất cả test chạy trên **MySQL thật** (không mock), mỗi test tự tạo dữ liệu riêng
nên chạy lại nhiều lần vẫn xanh.

---

## 5. Truy vấn SQL thực tế

Khi gọi `GET /api/users/1`, Hibernate sinh câu lệnh:

```sql
select u1_0.id,
       u1_0.created_at,
       u1_0.email,
       u1_0.full_name,
       u1_0.phone_number,
       u1_0.updated_at
from users u1_0
where u1_0.id = ?
```

---

## 6. Kết nối MySQL thành công

```
com.zaxxer.hikari.pool.HikariPool : HikariPool-1 - Added connection com.mysql.cj.jdbc.ConnectionImpl
Tomcat started on port 8081 (http)
Started UserServiceApplication in 9.36 seconds
```