# Kịch bản thuyết trình Bài kiểm tra 2 – Phần 2.2 (2,0 điểm)

Kịch bản này chỉ dành cho phần 2.2: Triển khai tích hợp và tiêu thụ dịch vụ. Các phần khác không thuộc phạm vi file này.

Cách dùng: đọc phần "Trên màn hình" để biết lúc nào thao tác. Phần lời nói chỉ là gợi ý, nói theo ý là được, không cần đọc y nguyên.

## Mở đầu (0:00 – 1:00)

Trên màn hình: sơ đồ kiến trúc và kết quả `docker compose ps`.

Em chào thầy và các bạn. Em xin trình bày phần 2.2 của bài kiểm tra: triển khai tích hợp và tiêu thụ dịch vụ, thang điểm 2,0.

Phần này không hỏi hệ thống có bao nhiêu service. Phần này hỏi ba điều: một Consumer có thật sự gọi Provider qua API không, dữ liệu trả về có được dùng đúng không, và khi Provider gặp sự cố thì Consumer xử lý thế nào.

Sản phẩm của em gồm ba phần: mã nguồn của Consumer và Provider, hợp đồng API, và bộ kiểm thử Postman gồm 13 request với kết quả chạy thật.

## Vai trò Consumer và Provider (1:00 – 2:30)

Trên màn hình: `BookingServiceImpl.java`, ba dòng đầu của hàm `createBooking`.

Trong quy trình đặt vé, Booking Service là Consumer. Lý do là nó không có dữ liệu người dùng và cũng không có dữ liệu ghế. Muốn có hai thứ đó, nó phải hỏi hai Provider.

User Service là Provider thứ nhất. Dịch vụ này trả hồ sơ theo tài khoản đăng nhập. Movie Service là Provider thứ hai. Dịch vụ này trả suất chiếu, giá vé, trạng thái ghế, và chịu trách nhiệm giữ ghế cũng như tính tiền.

Mỗi service sở hữu một cơ sở dữ liệu riêng. Booking Service chỉ đọc và ghi hai bảng là `booking` và `booking_seat`. Khi cần thông tin của người khác, nó gọi API. Nó không mở thẳng database của Provider. Đây là yêu cầu bắt buộc của đề bài.

Giao tiếp giữa các service dùng REST đồng bộ, vì nghiệp vụ cần câu trả lời ngay. Chưa biết ghế có giữ được hay không thì chưa thể lưu đơn. RabbitMQ được dùng cho sự kiện thanh toán, nhưng đó là nội dung của phần 2.3 và 2.5, em không trình bày ở đây.

Em muốn nhấn mạnh một điều: Consumer thiếu dữ liệu thì gọi API, không mở database của Provider.

## Hợp đồng API (2:30 – 4:00)

Trên màn hình: `docs/api/api-contract.md`, mục 5 và mục 6.

Hợp đồng API ghi rõ ba nội dung: API mà Provider cung cấp, API mà Consumer cung cấp, và cách ánh xạ lỗi.

Provider có bốn API chính. Có API lấy suất chiếu, API lấy trạng thái ghế, API giữ ghế cho client, và API giữ ghế nội bộ cho một đơn hàng. API nội bộ bắt buộc có header `X-Internal-Api-Key`. Nếu thiếu key thì trả về 401.

Consumer có hai API là tạo đơn và xem đơn. Khi tạo đơn, client gửi `showtimeId`, `seatIds`, `sessionId` và `requestId`. Kết quả trả về gồm `bookingId`, `amount`, `holdUntil` và `status`.

Em muốn thầy chú ý đến hai trường `amount` và `holdUntil`. Cả hai đều do Movie Service trả về. Booking Service không tự tính giá và cũng không tự quyết định thời hạn giữ ghế.

Về lỗi, có ba quy tắc. Provider trả 404 thì Consumer cũng trả 404. Provider timeout hoặc không kết nối được thì Consumer trả 503. Dữ liệu đầu vào sai thì trả 400. Không có lỗi nào bị biến thành 500 kèm stack trace.

Hợp đồng không chỉ là đường dẫn URL. Hợp đồng còn bao gồm kiểu dữ liệu, mã lỗi, và trách nhiệm của từng bên.

## Provider chạy độc lập (4:00 – 5:30)

Trên màn hình: chạy folder `01 - Provider API movie-service`.

Bây giờ em chạy folder kiểm thử của Provider. Các request gọi thẳng vào cổng 8083, không đi qua Gateway.

Folder này kiểm tra bốn việc. Thứ nhất, Provider trả danh sách suất chiếu. Thứ hai, Provider trả trạng thái ghế. Thứ ba, khi gọi một suất chiếu không tồn tại thì nhận 404 và không có stack trace. Thứ tư, khi gọi API nội bộ mà không có key thì nhận 401.

Sau khi kết quả hiện ra: cả bốn request đều đạt. Có mười một câu kiểm tra và tất cả đều xanh.

Kết quả này cho thấy Provider chạy được một mình và tự bảo vệ cửa nội bộ của nó. Provider không phụ thuộc vào Consumer.

## Luồng tích hợp thành công (5:30 – 8:00)

Trên màn hình: chạy folder `02 - Luong tich hop thanh cong`.

Bây giờ em đi qua một lượt đặt vé đầy đủ, từ đầu đến cuối, qua Gateway.

Trước tiên là đăng nhập để lấy JWT. Sau đó hệ thống tự chọn một suất chiếu còn ghế trống. Em làm vậy để bài kiểm thử không phụ thuộc vào dữ liệu cố định.

Tiếp theo, client giữ ghế qua Gateway và nhận về `holdUntil`.

Rồi đến bước quan trọng nhất là tạo đơn. Kết quả trả về mã 201 với trạng thái `PENDING`. Trong body, `showtimeId` đúng với giá trị đã gửi, `seatIds` có đúng một ghế, `amount` lớn hơn 0, và `holdUntil` có giá trị.

Em muốn nói kỹ điểm này. Hai trường `amount` và `holdUntil` không thể có mặt nếu Movie Service không trả về. Vì vậy đây là bằng chứng Consumer đã dùng thật kết quả của Provider.

Cuối cùng, hệ thống đọc lại đơn theo `bookingId`. Đơn vẫn ở trạng thái `PENDING` và số tiền không đổi. Điều này chứng minh đơn đã được ghi xuống database của Booking Service.

Nếu thầy hỏi vì sao đơn chưa là `PAID`, em xin trả lời: thanh toán là bước sau, thuộc phần 2.3 và 2.5. Phần 2.2 dừng ở việc tạo đơn và giữ ghế thành công.

Tóm lại, một request từ client đi qua Gateway, qua Consumer, sang hai Provider, và cuối cùng trả về một đơn hàng có dữ liệu thật.

## Hai tình huống lỗi (8:00 – 9:30)

Trên màn hình: chạy folder `03 - Loi tich hop` khi Movie Service còn chạy.

Em kiểm tra ba nhánh lỗi. E-01 là Provider báo không tìm thấy. E-02 là dữ liệu đầu vào sai. E-03 là Provider không khả dụng.

E-01 gửi một `showtimeId` không tồn tại. Movie Service trả 404. Booking Service bắt lỗi đó và trả về 404 với mã `SHOWTIME_NOT_FOUND`. Kết quả không có thông báo kết nối bị từ chối, cũng không có tên lớp Java nào lộ ra ngoài.

E-02 gửi `seatIds` rỗng. Lỗi này được chặn ngay tại Consumer bằng Bean Validation, trước khi gọi Provider. Kết quả là 400 với mã `INVALID_REQUEST`.

Trên màn hình: dừng hai instance Movie Service bằng lệnh đã chuẩn bị sẵn.

```bash
docker compose -f docker-compose.th8.yaml stop movie-service movie-service-2
```

Bây giờ em dừng cả hai instance của Movie Service. Em chờ khoảng 45 giây. Đây là độ trễ đã biết của Eureka: danh sách instance được cập nhật theo heartbeat, và LoadBalancer còn lưu cache, nên vẫn có thể còn địa chỉ cũ trong một thời gian.

Trên màn hình: chạy riêng E-03.

Kết quả là 503 với mã `SERVICE_UNAVAILABLE`, chỉ kèm một thông báo ngắn. Consumer đặt connect timeout là 2 giây và read timeout là 3 giây, nên request không bị treo vô hạn.

Trên màn hình: khởi động lại Movie Service.

```bash
docker compose -f docker-compose.th8.yaml start movie-service movie-service-2
```

Như vậy, 404 là lỗi nghiệp vụ, 400 là lỗi dữ liệu, còn 503 là lỗi hạ tầng. Mỗi loại có mã riêng và không lộ chi tiết nội bộ ra ngoài.

## Kết quả kiểm thử và kết luận (9:30 – 10:30)

Trên màn hình: kết quả chạy gần nhất trong Postman hoặc kết quả lint.

```bash
postman collection lint "postman/collections/MTBS - Kiem tra 2.2 Tich hop va tieu thu dich vu"
```

Bộ kiểm thử gồm 13 request, chia thành ba folder: Provider chạy độc lập, luồng tích hợp thành công, và lỗi tích hợp. Lần chạy đầy đủ có 35 câu kiểm tra, không có lỗi nào. Riêng E-03 tự bỏ qua khi Provider còn sống, và chỉ chạy khi Provider bị dừng. Lệnh lint cho kết quả không có vấn đề nào.

Log chạy đầy đủ nằm ở `docs/LeQuangHieu/testing/kt2-2.2-full-run.txt`. Log khi Provider bị dừng nằm ở `docs/LeQuangHieu/testing/kt2-2.2-provider-down.txt`. Bảng test case nằm ở `docs/LeQuangHieu/testing/integration-test.md`.

Em xin tóm lại ba điều phần 2.2 đã chứng minh. Thứ nhất, có Provider API thật và Consumer thật gọi qua API. Thứ hai, quy trình đặt vé hoàn thành và dùng dữ liệu do Provider trả về. Thứ ba, hệ thống xử lý được ba tình huống lỗi 404, 400 và 503, và Consumer không đọc database của Provider.

Về hạn chế, em chưa làm circuit breaker hay retry tự động, và timeout hiện đang cố định trong code. Đây là hướng mở rộng, không phải yêu cầu bắt buộc của phần 2.2.

Em xin cảm ơn thầy và các bạn.

## Gợi ý khi trả lời câu hỏi

Nếu thầy hỏi vì sao Booking là Consumer còn Movie là Provider: vì quyền sở hữu dữ liệu. Ghế và giá thuộc về Movie Service, nên Booking phải gọi để lấy, không được tự quyết.

Nếu thầy hỏi vì sao không cho Booking đọc thẳng bảng `showtime_seat`: làm vậy sẽ buộc hai service dùng chung schema, và bỏ qua toàn bộ quy tắc giữ ghế, giá và xác thực nội bộ. Đề bài cấm cách làm này.

Nếu thầy hỏi vì sao dùng 503 mà không dùng 500: 503 cho biết lỗi tạm thời ở dependency, client có thể thử lại. 500 là lỗi không xác định của chính Consumer.

Nếu thầy hỏi Movie Service chết giữa lúc đã giữ ghế nhưng chưa lưu đơn thì sao: Booking Service bắt được exception, nếu đã giữ ghế thì gọi API nhả ghế để bù trừ rồi mới ném lỗi. Như vậy không có ghế nào bị khóa mà không có đơn.
