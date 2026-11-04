package com.mtbs.auth_service.service;

import com.mtbs.auth_service.domain.entity.RedisToken;
import com.mtbs.auth_service.repository.RedisTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisTokenService {
    private final RedisTokenRepository redisTokenRepository;

    public String save(RedisToken token) {
        RedisToken result = redisTokenRepository.save(token);
        return result.getId();
    }

    public void delete(String id) {
        redisTokenRepository.deleteById(id);
    }

    public RedisToken findById(String id) {
        return redisTokenRepository.findById(id).orElseThrow(
                () -> new UsernameNotFoundException("Ko thay id trong redis")
        );
    }
}
