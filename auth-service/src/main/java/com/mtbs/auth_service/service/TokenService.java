package com.mtbs.auth_service.service;

import com.mtbs.auth_service.domain.entity.InvalidateToken;
import com.mtbs.auth_service.repository.InvalidateTokenRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public record TokenService(InvalidateTokenRepository invalidateTokenRepository) {
    public int save(InvalidateToken invalidateToken) {
        Optional<InvalidateToken> optional = invalidateTokenRepository.findByEmail(invalidateToken.getEmail());
        if (optional.isEmpty()) {
            invalidateTokenRepository.save(invalidateToken);
            return invalidateToken.getId();
        } else {
            InvalidateToken currentToken = optional.get();
            currentToken.setAccessToken(invalidateToken.getAccessToken());
            currentToken.setRefreshToken(invalidateToken.getRefreshToken());
            return currentToken.getId();
        }
    }

    public InvalidateToken getByEmail(String email) {
        InvalidateToken invalidateToken = invalidateTokenRepository.findByEmail(email).orElseThrow(
                () -> new UsernameNotFoundException("Email ko tim thay khi bang token")
        );
        return invalidateToken;
    }

    public String delete(InvalidateToken token) {
        invalidateTokenRepository.delete(token);
        return "Deleted";
    }
}
