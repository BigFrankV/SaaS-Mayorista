package com.mayorista.saas.shared.security;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

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

    /**
     * Blocks every token (access and refresh) of a user at once. The
     * JwtAuthenticationFilter checks this key per request, so disabling a
     * user kills their sessions immediately without a database hit per
     * request. The key expires after the access-token TTL, so a later
     * reactivation is never blocked for long.
     */
    public void blockUser(UUID userId, Duration ttl) {
        redisTemplate.opsForValue().set(userKey(userId), "1", ttl);
    }

    public boolean isUserBlocked(UUID userId) {
        Boolean exists = redisTemplate.hasKey(userKey(userId));
        return Boolean.TRUE.equals(exists);
    }

    /**
     * Called on successful login: lets a reactivated user in right away even
     * if a stale user-block key is still present.
     */
    public void clearUserBlocklist(UUID userId) {
        redisTemplate.delete(userKey(userId));
    }

    private String redisKey(String jti) {
        return "jwt:blocklist:" + jti;
    }

    private String userKey(UUID userId) {
        return "jwt:blocklist:user:" + userId;
    }
}
