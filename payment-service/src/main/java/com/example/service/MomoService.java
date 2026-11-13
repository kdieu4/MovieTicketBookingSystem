package com.example.service;

import com.example.domain.dto.request.MomoPaymentRequest;
import com.example.domain.dto.response.MomoPaymentResponse;

public interface MomoService {
    public MomoPaymentResponse createQr();
}
