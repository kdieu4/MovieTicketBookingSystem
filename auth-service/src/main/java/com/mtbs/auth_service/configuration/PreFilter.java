package com.mtbs.auth_service.configuration;

import com.mtbs.auth_service.service.JwtService;
import com.mtbs.auth_service.service.UserService;
import com.mtbs.auth_service.util.TokenType;
import io.micrometer.common.util.StringUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;

@Component
@Slf4j
public class PreFilter extends OncePerRequestFilter {
    private final UserService userService;
    private final JwtService jwtService;
    private final RestAuthenticationEntryPoint authEntryPoint;

    public PreFilter(
            UserService userService,
            JwtService jwtService,
            @Lazy RestAuthenticationEntryPoint authEntryPoint) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authEntryPoint = authEntryPoint;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        log.info("---------- doFilterInternal ----------");

        final String authorization = request.getHeader(AUTHORIZATION);
        //log.info("Authorization: {}", authorization);

        if (StringUtils.isBlank(authorization) || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authorization.substring("Bearer ".length());
        //log.info("Token: {}", token);


        try {
            if (!StringUtils.isEmpty(token)) {
                final String email = jwtService.extractEmail(token, TokenType.ACCESS_TOKEN);
                if (StringUtils.isNotEmpty(email) && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userService.userDetailsService().loadUserByUsername(email);
                    if (jwtService.isValid(token, userDetails, TokenType.ACCESS_TOKEN)) {
                        SecurityContext context = SecurityContextHolder.createEmptyContext();
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        context.setAuthentication(authentication);
                        SecurityContextHolder.setContext(context);
                    }
                }
            }
        } catch (Exception e) {
            authEntryPoint.commence(request, response, new BadCredentialsException("Invalid or expired access token", e));
            return;
        }
        filterChain.doFilter(request, response);
    }
}