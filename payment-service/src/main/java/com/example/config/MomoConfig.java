package com.example.config;

public record MomoConfig(
        String partnerCode,
        String accessKey,
        String secretKey,
        String endpoint,
        String redirectUrl,
        String ipnUrl
) {

}
