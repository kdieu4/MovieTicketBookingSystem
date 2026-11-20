package com.example.controller;

import com.example.base.RestApiV1;
import com.example.client.BookingOwnershipClient;
import com.example.domain.entity.Payment;
import com.example.domain.entity.PaymentStatus;
import com.example.messaging.PaymentEventProducer;
import com.example.repository.PaymentRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Thanh toan mo phong cho bai thuc hanh tich hop dich vu.
 *
 * <p>Thay vi phai co tai khoan VNPay sandbox, bai kiem thu can tao duoc mot ket
 * qua thanh toan THAT BAI mot cach chu dong. Endpoint nay lam dung nhung gi mot
 * cong thanh toan that se lam: kiem tra nguoi goi co phai chu don, ghi nhan ket
 * qua thanh toan, roi phat su kien de booking-service cap nhat trang thai don.
 */
@RestApiV1
@Slf4j
@Tag(name = "Payment (mock)")
@RequiredArgsConstructor
public class MockPaymentController {

    private static final String SUCCESS = "SUCCESS";
    private static final String FAILED = "FAILED";

    private final PaymentRepository paymentRepository;
    private final PaymentEventProducer paymentEventProducer;
    private final BookingOwnershipClient bookingOwnershipClient;

    public record MockPaymentRequest(
            @NotNull Long bookingId,
            BigDecimal amount,
            String result) {
    }

    @PostMapping("/payments/mock")
    public ResponseEntity<Map<String, Object>> pay(
            @Valid @RequestBody MockPaymentRequest request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {

        if (authorization == null || authorization.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Thieu access token");
        }

        // Nguoi thanh toan phai la chu don; booking-service la noi quyet dinh.
        bookingOwnershipClient.assertOwned(request.bookingId(), authorization);

        String result = request.result() == null
                ? SUCCESS
                : request.result().trim().toUpperCase();

        if (!SUCCESS.equals(result) && !FAILED.equals(result)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "result chi nhan SUCCESS hoac FAILED");
        }

        Payment payment = paymentRepository
                .findFirstByBookingIdOrderByIdDesc(request.bookingId())
                .orElse(null);

        if (payment == null) {
            if (request.amount() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Thieu amount khi tao thanh toan moi");
            }
            payment = Payment.builder()
                    .bookingId(request.bookingId())
                    .amount(request.amount())
                    .status(PaymentStatus.PENDING)
                    .build();
        }

        // Da co ket qua truoc do: tra lai ket qua cu, khong phat lai su kien.
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return ResponseEntity.ok(body(payment));
        }

        payment.setStatus(SUCCESS.equals(result)
                ? PaymentStatus.SUCCESS
                : PaymentStatus.FAILED);

        Payment saved = paymentRepository.saveAndFlush(payment);
        paymentEventProducer.sendPaymentCompleted(saved);

        log.info("Mock payment {} for booking {} -> {}",
                saved.getId(), saved.getBookingId(), saved.getStatus());

        return ResponseEntity.ok(body(saved));
    }

    private Map<String, Object> body(Payment payment) {
        return Map.of(
                "paymentId", payment.getId(),
                "bookingId", payment.getBookingId(),
                "status", payment.getStatus().name(),
                "transactionCode", "MOCK-" + payment.getId());
    }
}
