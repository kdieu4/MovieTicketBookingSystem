package com.mtbs.auth_service.repository;

import com.mtbs.auth_service.domain.entity.RedisToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RedisTokenRepository extends CrudRepository<RedisToken, String> {
    Optional<RedisToken> findById(String id);
}
