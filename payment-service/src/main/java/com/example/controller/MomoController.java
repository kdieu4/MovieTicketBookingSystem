package com.example.controller;

import com.example.base.RestApiV1;
import com.example.constant.UrlConstant;
import com.example.domain.dto.response.MomoPaymentResponse;
import com.example.service.MomoService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;

@RequiredArgsConstructor
@RestApiV1
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MomoController {
    MomoService momoService;

    @PostMapping(UrlConstant.Momo.CREATE)
    public MomoPaymentResponse createQR() {
        return momoService.createQr();
    }
}
