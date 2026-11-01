package com.mtbs.auth_service.service.impl;

import com.mtbs.auth_service.service.JwtService;
import com.mtbs.auth_service.util.TokenType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import static com.mtbs.auth_service.util.TokenType.*;

@Service
public class JwtServiceImpl implements JwtService {
    @Value("${jwt.expiryHour}")
    private Long expiryHour;

    @Value("${jwt.expiryDay}")
    private Long expiryDay;

    @Value("${jwt.secretKey}")
    private String secretKey;

    @Value("${jwt.refreshKey}")
    private String refreshKey;

    @Value("${jwt.resetKey}")
    private String resetKey;


    @Override
    public String generateToken(UserDetails user) {
        // TODO xu ly tao ra token
        return generateToken(new HashMap<>(), user);
    }

    @Override
    public String extractEmail(String token, TokenType tokenType) {
        return extractClaims(token, Claims::getSubject, tokenType);
    }

    @Override
    public boolean isValid(String token, UserDetails userDetail, TokenType tokenType) {
        final String userEmail = extractEmail(token, tokenType);
        return userEmail.equals(userDetail.getUsername()) && !isTokenExpire(token, tokenType);
    }

    private boolean isTokenExpire(String token, TokenType tokenType) {
        return extractExpiration(token, tokenType).before(new Date());
    }

    private Date extractExpiration(String token, TokenType tokenType) {
        return extractClaims(token, Claims::getExpiration, tokenType);
    }

    @Override
    public String generateRefreshToken(UserDetails userDetails) {
        return generateRefreshToken(new HashMap<>(), userDetails);
    }

    @Override
    public String generateResetToken(UserDetails userDetails) {
        return generateResetToken(new HashMap<>(), userDetails);
    }

    private String generateResetToken(Map<String, Object> claims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(claims) // thong tin trong payload, dang map, ko muon hien thi trong token
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 tieng
                .signWith(getKey(RESET_TOKEN), SignatureAlgorithm.HS256) // thuat toan
                .compact();
    }

    private String generateRefreshToken(Map<String, Object> claims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(claims) // thong tin trong payload, dang map, ko muon hien thi trong token
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * expiryDay)) // 14 ngay
                .signWith(getKey(REFRESH_TOKEN), SignatureAlgorithm.HS256) // thuat toan
                .compact();
    }

    private String generateToken(Map<String, Object> claims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(claims) // thong tin trong payload, dang map, ko muon hien thi trong token
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * expiryHour)) // 8 tieng
                .signWith(getKey(ACCESS_TOKEN), SignatureAlgorithm.HS256) // thuat toan
                .compact();
    }

    private Key getKey(TokenType tokenType) {
        switch (tokenType) {
            case ACCESS_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
            }
            case REFRESH_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(refreshKey));
            }
            case RESET_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(resetKey));
            }
            default -> throw new IllegalArgumentException("Token Type invalid");
        }
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimResolver, TokenType tokenType) {
        final Claims claims = extraAllClaims(token, tokenType);
        return claimResolver.apply(claims);
    }

    private Claims extraAllClaims(String token, TokenType tokenType) {
        return Jwts.parserBuilder().setSigningKey(getKey(tokenType))
                .build().parseClaimsJws(token).getBody();
    }
}
