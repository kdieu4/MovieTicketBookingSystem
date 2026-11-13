package com.example.controller;

import com.example.base.ApiResponse;
import com.example.base.RestApiV1;
import com.example.domain.dto.request.VNPayRequest;
import com.example.service.impl.VNPayService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RequiredArgsConstructor
@RestApiV1
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VNPayController {
    private final VNPayService vnPayService;

    @PostMapping("/vnpay")
    public ResponseEntity<Map<String, String>> createPayment(@RequestBody VNPayRequest request) {
        String payUrl = vnPayService.createPaymentUrl(request.bookingId());
        return ResponseEntity.ok(Map.of("payUrl", payUrl));
    }

    // @GetMapping("/vnpay/return")
    // public ResponseEntity<?> paymentReturn(@RequestParam Map<String, String>
    // params) {
    // return ResponseEntity.ok(vnPayService.handleReturn(params));
    // }

    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> paymentReturn(@RequestParam Map<String, String> params) {

        Map<String, String> result = vnPayService.handleReturn(params);

        String url = UriComponentsBuilder
                .fromUriString("http://localhost:3000/payment/return")
                .queryParam("status", result.get("status"))
                .queryParam("txnRef", params.getOrDefault("vnp_TxnRef", ""))
                .build()
                .encode()
                .toUriString();

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url))
                .build();
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<?> paymentIpn(
            @RequestParam Map<String, String> params) {
        log.info("Received VNPay IPN: txnRef={}",
                params.get("vnp_TxnRef"));
        return ResponseEntity.ok(vnPayService.handleIpn(params));
    }
}
