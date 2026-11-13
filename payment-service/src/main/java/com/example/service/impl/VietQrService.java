package com.example.service.impl;

import com.example.domain.dto.response.VietQrPaymentResponse;
import com.example.domain.entity.PaymentStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VietQrService {
    @Value(value = "${vietqr.bank-id}")
    String bankId;

    @Value("${vietqr.account-no}")
    private String accountNo;

    @Value("${vietqr.account-name}")
    private String accountName;

    public VietQrPaymentResponse generateQrUrl() {
        Long paymentId = Long.valueOf(10010);
        Long bookingId = Long.valueOf(10000);
        BigDecimal amount = BigDecimal.valueOf(10000);
        String description = "MTBS" + bookingId;
        String qrUrl = UriComponentsBuilder
                .fromUriString("https://img.vietqr.io/image/{bank}-{account}-compact2.png")
                .queryParam("amount", amount.toBigIntegerExact())
                .queryParam("addInfo", description)
                .queryParam("accountName", accountName)
                .encode()
                .buildAndExpand(bankId, accountNo)
                .toUriString();
        return VietQrPaymentResponse.from(paymentId, bookingId, amount, qrUrl);
    }
}
