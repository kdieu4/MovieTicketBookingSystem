package com.mtbs.auth_service.repository;

import com.mtbs.auth_service.domain.entity.InvalidateToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvalidateTokenRepository extends JpaRepository<InvalidateToken, Integer> {
    Optional<InvalidateToken> findByEmail(String email);
}