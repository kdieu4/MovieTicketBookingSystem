package com.example.domain.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MomoPaymentRequest {
    String partnerCode;
    String requestType;
    String ipnUrl;
    String orderId;
    long amount;
    String orderInfo;
    String requestId;
    String redirectUrl;
    String lang;
    String extraData;
    String signature;
}
