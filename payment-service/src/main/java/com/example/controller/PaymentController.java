package com.example.controller;

import com.example.base.ApiResponse;
import com.example.base.RestApiV1;
import com.example.constant.SuccessMessage;
import com.example.constant.UrlConstant;
import com.example.domain.dto.response.PaymentResponse;
import com.example.repository.PaymentRepository;
import com.example.service.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestApiV1
@Validated
@Slf4j
@Tag(name = "Payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;
    PaymentRepository paymentRepository;

    @GetMapping(UrlConstant.Payment.BY_ID)
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long paymentId) {
        PaymentResponse response = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(ApiResponse.success(SuccessMessage.Payment.GET_PAYMENT_SUCCESS, response));
    }

    @GetMapping("/payments/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBookingId(
            @PathVariable Long bookingId) {

        return paymentRepository
                .findFirstByBookingIdOrderByIdDesc(bookingId)
                .map(payment -> ResponseEntity.ok(Map.of(
                        "id", payment.getId(),
                        "bookingId", payment.getBookingId(),
                        "paymentStatus", payment.getStatus().name())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
