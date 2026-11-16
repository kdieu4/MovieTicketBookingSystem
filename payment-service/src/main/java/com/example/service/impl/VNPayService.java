package com.example.service.impl;

import com.example.config.VNPayProperties;
import com.example.domain.entity.Payment;
import com.example.domain.entity.PaymentStatus;
import com.example.messaging.PaymentEventProducer;
import com.example.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final VNPayProperties properties;
    private final PaymentRepository paymentRepository;
    private final PaymentEventProducer paymentEventProducer;

    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    // 1. Tạo URL thanh toán từ Booking
    public String createPaymentUrl(Long bookingId) {

        Payment payment = paymentRepository
                .findFirstByBookingIdOrderByIdDesc(bookingId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Payment chưa tồn tại cho Booking: " + bookingId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Payment không ở trạng thái PENDING");
        }

        BigDecimal amount = payment.getAmount();

        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Số tiền không hợp lệ");
        }

        String transactionRef = "P" + payment.getId();

        LocalDateTime now = LocalDateTime.now(VIETNAM);

        Map<String, String> params = new TreeMap<>();

        params.put("vnp_Version", properties.version());
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", properties.tmnCode());
        params.put("vnp_Amount", amount.multiply(BigDecimal.valueOf(100)).toBigIntegerExact().toString());
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_OrderInfo", "Thanh toan booking " + bookingId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", properties.returnUrl());
        // TODO: Lấy IP thật của client từ request
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", now.format(FORMATTER));
        params.put("vnp_ExpireDate", now.plusMinutes(5).format(FORMATTER));
        params.put("vnp_TxnRef", transactionRef);

        String query = buildQueryString(params);
        String signature = hmacSHA512(properties.hashSecret(), query);

        return properties.payUrl()
                + "?" + query
                + "&vnp_SecureHash=" + signature;
    }

    // 2. Tạo query string. VNPay chỉ ký các tham số có giá trị nên bỏ tham số rỗng
    // khi đối chiếu chữ ký, nếu không hash sẽ lệch.
    private String buildQueryString(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(e -> e.getValue() != null && !e.getValue().isEmpty())
                .map(e -> encode(e.getKey()) + "=" + encode(e.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    // 3. Tạo chữ ký HMAC-SHA512
    private String hmacSHA512(String secret, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");

            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));

            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));

        } catch (Exception e) {
            throw new IllegalStateException("Không thể tạo chữ ký VNPay", e);
        }
    }

    // 4. Xác thực chữ ký từ VNPay
    public boolean verifySignature(Map<String, String> callback) {

        String receivedHash = callback.get("vnp_SecureHash");

        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }

        Map<String, String> params = new TreeMap<>(callback);
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String calculatedHash = hmacSHA512(properties.hashSecret(), buildQueryString(params));

        return MessageDigest.isEqual(
                calculatedHash.getBytes(StandardCharsets.US_ASCII),
                receivedHash.toLowerCase(java.util.Locale.ROOT)
                        .getBytes(StandardCharsets.US_ASCII));
    }

    // 5. Xử lý browser redirect. Xác nhận thanh toán ngay tại đây thay vì chờ
    // IPN, vì VNPay không gọi được IPN khi server chạy localhost. Tham số
    // return do VNPay ký bằng hashSecret nên không thể bị client giả mạo.
    @Transactional
    public Map<String, String> handleReturn(Map<String, String> params) {

        CallbackResult result = confirmPayment(params);

        return Map.of("status", result.status(), "message", result.message());
    }

    // 6. Xử lý IPN. Dùng chung logic xác nhận với return URL; giữ format
    // RspCode/Message theo yêu cầu của VNPay.
    @Transactional
    public Map<String, String> handleIpn(Map<String, String> params) {

        CallbackResult result = confirmPayment(params);

        return response(result.code(), result.message());
    }

    // Xác thực callback và cập nhật Payment một cách idempotent. Chỉ trả về
    // kết quả; giao dịch do handleReturn/handleIpn mở nên chạy qua proxy.
    private CallbackResult confirmPayment(Map<String, String> params) {

        log.info("Received VNPay callback: txnRef={}, responseCode={}, transactionStatus={}",
                params.get("vnp_TxnRef"),
                params.get("vnp_ResponseCode"),
                params.get("vnp_TransactionStatus"));

        if (!verifySignature(params)) {
            return new CallbackResult("97", "INVALID_SIGNATURE", "Invalid signature");
        }

        if (!properties.tmnCode().equals(params.get("vnp_TmnCode"))) {
            return new CallbackResult("97", "INVALID_SIGNATURE", "Invalid merchant");
        }

        String txnRef = params.get("vnp_TxnRef");

        if (txnRef == null || !txnRef.matches("P[0-9]+")) {
            return new CallbackResult("01", "ORDER_NOT_FOUND", "Order not found");
        }

        Long paymentId;

        try {
            paymentId = Long.parseLong(txnRef.substring(1));
        } catch (NumberFormatException e) {
            return new CallbackResult("01", "ORDER_NOT_FOUND", "Order not found");
        }

        Payment payment = paymentRepository
                .findByIdForUpdate(paymentId)
                .orElse(null);

        if (payment == null) {
            return new CallbackResult("01", "ORDER_NOT_FOUND", "Order not found");
        }

        // Đối chiếu số tiền VNPay với database
        try {
            BigDecimal receivedAmount = new BigDecimal(params.get("vnp_Amount"));

            BigDecimal expectedAmount = payment.getAmount()
                    .multiply(BigDecimal.valueOf(100));

            if (receivedAmount.compareTo(expectedAmount) != 0) {
                return new CallbackResult("04", "INVALID_AMOUNT", "Invalid amount");
            }
        } catch (RuntimeException e) {
            return new CallbackResult("04", "INVALID_AMOUNT", "Invalid amount");
        }

        // Idempotency: callback lặp lại chỉ trả trạng thái đã lưu, không publish
        // thêm sự kiện.
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return new CallbackResult(
                    "02",
                    payment.getStatus().name(),
                    "Order already confirmed");
        }

        boolean success = "00".equals(params.get("vnp_ResponseCode"))
                && "00".equals(params.get("vnp_TransactionStatus"));

        payment.setStatus(
                success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);

        paymentRepository.save(payment);

        if (success) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            try {
                                paymentEventProducer.sendPaymentCompleted(payment);
                            } catch (Exception e) {
                                log.error("Failed to publish PaymentCompletedEvent", e);
                            }
                        }
                    });
        }

        log.info("Payment {} confirmed as {}", payment.getId(), payment.getStatus());

        return new CallbackResult(
                "00",
                payment.getStatus().name(),
                success ? "Confirm Success" : "Payment failed");
    }

    private record CallbackResult(String code, String status, String message) {
    }

    private Map<String, String> response(String code, String message) {
        return Map.of("RspCode", code, "Message", message);
    }
}