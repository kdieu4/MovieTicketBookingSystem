package com.mtbs.movie_service.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

/**
 * Xac thuc JWT do auth-service phat hanh va phan quyen API cua movie-service.
 *
 * <p>Tra cuu phim/lich chieu/ghe la API cong khai. Giu/nha/ghep ghe la thao tac
 * tam thoi nen van cho phep khach chua dang nhap (booking se kiem tra dang nhap).
 * Quan ly suat chieu danh cho STAFF/ADMIN, quan ly danh muc phim/rap/phong/ghe
 * danh cho ADMIN. API noi bo duoc bao ve bang X-Internal-Api-Key tai controller.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/get*", "/api/search*", "/api/showtimes/**", "/api/instance-info")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/holdSeats", "/api/releaseSeats", "/api/confirmSeats")
                        .permitAll()
                        // Xac thuc bang X-Internal-Api-Key trong InternalSeatClaimController.
                        .requestMatchers("/api/internal/**").permitAll()
                        .requestMatchers("/actuator/**", "/v3/api-docs/**",
                                "/swagger-ui/**", "/swagger-ui.html", "/error")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/createShowtime")
                        .hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/updateShowtime")
                        .hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/deleteShowtime")
                        .hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/createMovie", "/api/createGenre",
                                "/api/createCinema", "/api/createRoom", "/api/createSeat")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/updateMovie", "/api/updateGenre",
                                "/api/updateCinema", "/api/updateRoom", "/api/updateSeat")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/deleteMovie", "/api/deleteGenre",
                                "/api/deleteCinema", "/api/deleteRoom", "/api/deleteSeat")
                        .hasRole("ADMIN")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    /** Cung key va cung cach ma hoa Base64 voi auth-service. */
    @Bean
    public JwtDecoder jwtDecoder(@Value("${jwt.secretKey}") String secretKey) {
        SecretKey key = new SecretKeySpec(Base64.getDecoder().decode(secretKey), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    /** auth-service dat quyen vao claim "roles" duoi dang ROLE_*. */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("roles");
        authorities.setAuthorityPrefix("");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return converter;
    }
}