package com.mayorista.saas.shared.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class LoginLockoutService {

    private final StringRedisTemplate redisTemplate;
    private final int maxAttempts;
    private final Duration lockoutDuration;

    public LoginLockoutService(
            StringRedisTemplate redisTemplate,
            @Value("${app.security.login.max-attempts:5}") int maxAttempts,
            @Value("${app.security.login.lockout-minutes:15}") int lockoutMinutes
    ) {
        this.redisTemplate = redisTemplate;
        this.maxAttempts = maxAttempts;
        this.lockoutDuration = Duration.ofMinutes(lockoutMinutes);
    }

    public void recordFailedAttempt(String email) {
        String key = lockoutKey(email);
        Long attempts = redisTemplate.opsForValue().increment(key);
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, lockoutDuration);
        }
    }

    public boolean isBlocked(String email) {
        String val = redisTemplate.opsForValue().get(lockoutKey(email));
        if (val == null) return false;
        try {
            return Integer.parseInt(val) >= maxAttempts;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public void resetAttempts(String email) {
        redisTemplate.delete(lockoutKey(email));
    }

    public int getRemainingAttempts(String email) {
        String val = redisTemplate.opsForValue().get(lockoutKey(email));
        if (val == null) return maxAttempts;
        try {
            return Math.max(0, maxAttempts - Integer.parseInt(val));
        } catch (NumberFormatException e) {
            return maxAttempts;
        }
    }

    private String lockoutKey(String email) {
        return "lockout:login:" + email.toLowerCase();
    }
}
