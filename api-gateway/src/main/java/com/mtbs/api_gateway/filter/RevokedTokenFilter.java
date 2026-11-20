package com.mtbs.api_gateway.filter;

import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

/**
 * Tu choi access token da bi thu hoi khi logout.
 *
 * <p>auth-service ghi jti vao Redis luc logout; gateway chi doc blacklist, con
 * chu ky van do tung service kiem tra. Redis loi thi cho qua de khong bien su
 * co Redis thanh su co toan he thong.
 */
@Component
public class RevokedTokenFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RevokedTokenFilter.class);
    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final ReactiveStringRedisTemplate redis;

    public RevokedTokenFilter(ReactiveStringRedisTemplate redis) {
        this.redis = redis;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String authorization = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return chain.filter(exchange);
        }

        String jti = readJti(authorization.substring("Bearer ".length()));
        if (jti == null) {
            return chain.filter(exchange);
        }

        return redis.hasKey(BLACKLIST_PREFIX + jti)
                .onErrorResume(error -> {
                    log.warn("Redis unavailable, skipping token revocation check: {}", error.getMessage());
                    return Mono.just(false);
                })
                .flatMap(revoked -> {
                    if (Boolean.TRUE.equals(revoked)) {
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }
                    return chain.filter(exchange);
                });
    }

    /** Doc payload khong can verify chu ky; service phia sau van verify. */
    static String readJti(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return null;
            }
            JsonNode payload = MAPPER.readTree(Base64.getUrlDecoder().decode(parts[1]));
            return payload.path("jti").isTextual() ? payload.get("jti").asText() : null;
        } catch (Exception exception) {
            return null;
        }
    }

    @Override
    public int getOrder() {
        return -2;
    }
}
