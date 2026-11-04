package com.mtbs.auth_service.domain.entity;

import lombok.*;
import org.springframework.data.redis.core.RedisHash;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@RedisHash("RedisToken")
public class RedisToken {
    private String id;
    private String accessToken;
    private String refreshToken;
    private String resetToken;
}
