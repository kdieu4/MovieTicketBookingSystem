package com.example.controller;

import com.example.base.ApiResponse;
import com.example.base.RestApiV1;
import com.example.constant.SuccessMessage;
import com.example.constant.UrlConstant;
import com.example.domain.dto.response.VietQrPaymentResponse;
import com.example.domain.entity.Payment;
import com.example.service.impl.VietQrService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RequiredArgsConstructor
@RestApiV1
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VietQrController {
    VietQrService vietQrService;

    @GetMapping(UrlConstant.VIETQR_PAYMENT)
    public ResponseEntity<ApiResponse<VietQrPaymentResponse>> generateQr(){
        VietQrPaymentResponse response = vietQrService.generateQrUrl();
        return ResponseEntity.ok().body(ApiResponse.success(SuccessMessage.Payment.GET_PAYMENT_SUCCESS, response));
    }

}
