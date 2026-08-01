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
    private final int loginMaxRequestsPerMinute;
    private final int refreshMaxRequestsPerMinute;

    public AuthRateLimitFilter(
            StringRedisTemplate redisTemplate,
            @Value("${app.security.login.rate-limit-per-minute:10}") int loginMaxRequestsPerMinute,
            @Value("${app.security.refresh.rate-limit-per-minute:5}") int refreshMaxRequestsPerMinute
    ) {
        this.redisTemplate = redisTemplate;
        this.loginMaxRequestsPerMinute = loginMaxRequestsPerMinute;
        this.refreshMaxRequestsPerMinute = refreshMaxRequestsPerMinute;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        EndpointType type = resolveRateLimitedEndpoint(request);
        if (type == EndpointType.NONE) {
            chain.doFilter(request, response);
            return;
        }

        String ip = resolveClientIp(request);
        String key = type == EndpointType.LOGIN
                ? "ratelimit:login:" + ip
                : "ratelimit:refresh:" + ip;
        int maxRequests = type == EndpointType.LOGIN
                ? loginMaxRequestsPerMinute
                : refreshMaxRequestsPerMinute;

        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }

        if (count != null && count > maxRequests) {
            response.setStatus(429);
            response.setContentType("application/json");
            String message = type == EndpointType.LOGIN
                    ? "{\"message\":\"Demasiados intentos de inicio de sesion. Intente nuevamente en 1 minuto.\"}"
                    : "{\"message\":\"Demasiadas solicitudes de renovacion de token. Intente nuevamente en 1 minuto.\"}";
            response.getWriter().write(message);
            return;
        }

        chain.doFilter(request, response);
    }

    private EndpointType resolveRateLimitedEndpoint(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return EndpointType.NONE;
        }
        String uri = request.getRequestURI();
        if (uri.endsWith("/auth/login") || uri.contains("/auth/login")) {
            return EndpointType.LOGIN;
        }
        if (uri.endsWith("/auth/refresh") || uri.contains("/auth/refresh")) {
            return EndpointType.REFRESH;
        }
        return EndpointType.NONE;
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

    private enum EndpointType {
        NONE, LOGIN, REFRESH
    }
}
