package com.mayorista.saas.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private final RateLimitConfig loginConfig;
    private final RateLimitConfig refreshConfig;
    private final RateLimitConfig bootstrapConfig;
    private final RateLimitConfig registrationConfig;

    public AuthRateLimitFilter(
            StringRedisTemplate redisTemplate,
            @Value("${app.security.login.rate-limit-per-minute:10}") int loginMaxRequestsPerMinute,
            @Value("${app.security.refresh.rate-limit-per-minute:5}") int refreshMaxRequestsPerMinute,
            @Value("${app.security.bootstrap.rate-limit-per-minute:5}") int bootstrapMaxRequestsPerMinute,
            @Value("${app.security.registration.rate-limit-per-minute:5}") int registrationMaxRequestsPerMinute
    ) {
        this.redisTemplate = redisTemplate;
        this.loginConfig = new RateLimitConfig("ratelimit:login:", loginMaxRequestsPerMinute,
                "Too many login attempts. Please try again in 1 minute.");
        this.refreshConfig = new RateLimitConfig("ratelimit:refresh:", refreshMaxRequestsPerMinute,
                "Too many token refresh requests. Please try again in 1 minute.");
        this.bootstrapConfig = new RateLimitConfig("ratelimit:bootstrap:", bootstrapMaxRequestsPerMinute,
                "Too many bootstrap requests. Please try again in 1 minute.");
        this.registrationConfig = new RateLimitConfig("ratelimit:register:", registrationMaxRequestsPerMinute,
                "Too many registration requests. Please try again in 1 minute.");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        RateLimitConfig config = resolveRateLimitedEndpoint(request);
        if (config == null) {
            chain.doFilter(request, response);
            return;
        }

        String ip = resolveClientIp(request);
        String key = config.redisKeyPrefix() + ip;

        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }

        if (count != null && count > config.maxRequests()) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"" + config.message() + "\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private RateLimitConfig resolveRateLimitedEndpoint(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return null;
        }
        String uri = request.getRequestURI();
        if (uri.endsWith("/auth/login") || uri.contains("/auth/login")) {
            return loginConfig;
        }
        if (uri.endsWith("/auth/refresh") || uri.contains("/auth/refresh")) {
            return refreshConfig;
        }
        if (uri.endsWith("/auth/bootstrap") || uri.contains("/auth/bootstrap")) {
            return bootstrapConfig;
        }
        if (uri.endsWith("/tenants/register") || uri.contains("/tenants/register")) {
            return registrationConfig;
        }
        return null;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }

    private record RateLimitConfig(String redisKeyPrefix, int maxRequests, String message) {
    }
}
