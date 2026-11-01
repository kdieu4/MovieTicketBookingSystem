package com.mtbs.auth_service.configuration;

import com.mtbs.auth_service.service.UserService;
import jakarta.validation.constraints.NotNull;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@RequiredArgsConstructor
public class AppConfig {
    private final UserService userService;
    private final PreFilter preFilter;

    private String[] WHITE_LIST = {
            "/auth/**",
            "/error/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**"
    };

    // Thiet lap cors cho cac domain se su dung api backend
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:8085")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }

    // Ma hoa mat khau
    @Bean
    public PasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Thiet lap kieu stateless cua session (ko luu token o server),
    // Su dung whitelist de api do ko can token
    // Thiet lap provider
    @Bean
    public SecurityFilterChain configure(@NotNull HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable);
        http.authorizeHttpRequests(authorizeRequest -> authorizeRequest
                        .requestMatchers(WHITE_LIST)
                        .permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(manager -> manager.sessionCreationPolicy(STATELESS))
                .authenticationProvider(provider()).addFilterBefore(preFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // cung cap truy cap den dao
    @Bean
    public AuthenticationProvider provider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userService.userDetailsService());
        provider.setPasswordEncoder(getPasswordEncoder());
        return provider;
    }

    // Thiet lap cac path cho swagger
//    @Bean
//    public WebSecurityCustomizer webSecurityCustomizer() {
//        return webSecurity -> webSecurity.ignoring()
//                .requestMatchers("/swagger-ui*/*", "/v3/api-docs/**");
//    }

    // Quan ly cac role truy cap he thong
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}