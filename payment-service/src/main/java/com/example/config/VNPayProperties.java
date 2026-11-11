package com.example.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vnpay")
public record VNPayProperties(
        String tmnCode,
        String hashSecret,
        String payUrl,
        String returnUrl,
        String version
) {
}
