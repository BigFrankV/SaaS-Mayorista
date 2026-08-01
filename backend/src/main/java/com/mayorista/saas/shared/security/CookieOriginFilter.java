package com.mayorista.saas.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * CSRF mitigation for the cookie-based endpoints (/auth/refresh, /auth/logout).
 *
 * <p>The refresh token travels in an httpOnly cookie, so those two endpoints are
 * the only ones where a cross-site request could carry credentials. Browsers send
 * the Origin header on every POST, and JavaScript cannot forge it, so it is a
 * reliable signal: if the Origin is present and matches neither the configured
 * allowlist (app.cors.allowed-origins) nor the request's own host (same-origin
 * behind the nginx proxy), the request is rejected with 403.</p>
 */
@Component
public class CookieOriginFilter extends OncePerRequestFilter {

    private final Set<String> allowedOrigins;

    public CookieOriginFilter(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(CookieOriginFilter::normalize)
                .collect(Collectors.toSet());
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String uri = request.getRequestURI();
        return !(uri.endsWith("/auth/refresh") || uri.endsWith("/auth/logout"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String origin = request.getHeader("Origin");
        if (origin != null && !origin.isBlank() && !isAllowed(request, origin)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Origin not allowed\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private boolean isAllowed(HttpServletRequest request, String origin) {
        String normalized = normalize(origin);
        if (allowedOrigins.contains(normalized)) {
            return true;
        }
        String sameOrigin = expectedSameOrigin(request);
        return sameOrigin != null && normalized.equals(sameOrigin);
    }

    private String expectedSameOrigin(HttpServletRequest request) {
        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null || scheme.isBlank()) {
            scheme = request.getScheme();
        }
        String host = request.getHeader("Host");
        if (host == null || host.isBlank()) {
            return null;
        }
        return normalize(scheme + "://" + host);
    }

    private static String normalize(String origin) {
        String normalized = origin.trim().toLowerCase();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
}
