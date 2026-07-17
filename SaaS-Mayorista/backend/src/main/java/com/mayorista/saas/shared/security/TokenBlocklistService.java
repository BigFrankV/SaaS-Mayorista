package com.mayorista.saas.shared.security;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class TokenBlocklistService {

    private final StringRedisTemplate redisTemplate;

    public TokenBlocklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void blockJti(String jti, Duration ttl) {
        redisTemplate.opsForValue().set(redisKey(jti), "1", ttl);
    }

    public boolean isBlocked(String jti) {
        Boolean exists = redisTemplate.hasKey(redisKey(jti));
        return Boolean.TRUE.equals(exists);
    }

    private String redisKey(String jti) {
        return "jwt:blocklist:" + jti;
    }
}
