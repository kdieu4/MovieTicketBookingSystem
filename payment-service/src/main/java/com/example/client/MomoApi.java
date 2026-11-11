package com.example.client;

import com.example.domain.dto.request.MomoPaymentRequest;
import com.example.domain.dto.response.MomoPaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name="momo", url="${momo.endpoint}")
public interface MomoApi {
    @PostMapping("/create")
    MomoPaymentResponse createMomoQr(@RequestBody MomoPaymentRequest request);
}
