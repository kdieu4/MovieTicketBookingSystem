package com.example.service.impl;

import com.example.domain.dto.response.PaymentResponse;
import com.example.domain.entity.Payment;
import com.example.domain.entity.PaymentStatus;
import com.example.exception.PaymentNotFoundException;
import com.example.exception.PaymentProcessingException;
import com.example.service.PaymentService;
import com.example.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {
    PaymentRepository paymentRepository;

    @Override
    public Payment createPayment(Long bookingId, BigDecimal amount) {
        Payment payment = Payment.builder()
                .bookingId(bookingId)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .build();
        return paymentRepository.save(payment);
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id).orElseThrow(() ->
                new PaymentNotFoundException("Payment not found with id: " + id));

        return PaymentResponse.from(payment);
    }

    @Override
    public Payment processPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow(() ->
                new PaymentNotFoundException("Payment not found with id: " + paymentId));

        try {
            payment.setStatus(PaymentStatus.SUCCESS);
            return paymentRepository.save(payment);
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            throw new PaymentProcessingException("Failed to process payment: " + paymentId);
        }
    }
}