package com.example.service;

import com.example.domain.dto.response.PaymentResponse;
import com.example.domain.entity.Payment;

import java.math.BigDecimal;

public interface PaymentService {
    Payment createPayment(Long bookingId, BigDecimal amount);

    PaymentResponse getPaymentById(Long id);

    Payment processPayment(Long paymentId);
}
