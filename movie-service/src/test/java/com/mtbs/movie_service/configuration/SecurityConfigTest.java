package com.mtbs.movie_service.configuration;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityConfigTest {

    @Test
    void rolesClaimBecomesRoleAuthority() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "HS256")
                .subject("admin@example.com")
                .claim("roles", List.of("ROLE_ADMIN"))
                .build();

        var authentication = new SecurityConfig()
                .jwtAuthenticationConverter()
                .convert(jwt);

        assertThat(authentication.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .contains("ROLE_ADMIN");
    }
}
