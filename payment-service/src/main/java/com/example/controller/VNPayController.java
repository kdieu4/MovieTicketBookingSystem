package com.example.controller;

import com.example.base.ApiResponse;
import com.example.base.RestApiV1;
import com.example.service.impl.VNPayService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@RequiredArgsConstructor
@RestApiV1
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VNPayController {
    private final VNPayService vnPayService;

    @PostMapping("/vnpay")
    public ResponseEntity<String> createPayment() {
        return ResponseEntity.ok().body(vnPayService.createPaymentUrl());
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<?> paymentReturn(
            @RequestParam Map<String, String> params
    ) {
        return ResponseEntity.ok(vnPayService.handleReturn(params));
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<?> paymentIpn(
            @RequestParam Map<String, String> params
    ) {
        return ResponseEntity.ok(vnPayService.handleIpn(params));
    }
}
