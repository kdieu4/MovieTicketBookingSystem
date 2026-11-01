package com.mtbs.auth_service.service;

import com.mtbs.auth_service.util.TokenType;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateToken(UserDetails user);

    String generateRefreshToken(UserDetails userDetails);

    String generateResetToken(UserDetails userDetails);

    String extractEmail(String token, TokenType tokenType);

    boolean isValid(String token, UserDetails user, TokenType tokenType);


}
