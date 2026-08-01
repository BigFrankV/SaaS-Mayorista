package com.mayorista.saas.shared.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Minimal HTTP access logging: method, path, status, duration and (when the
 * request carries a valid JWT) userId/tenantId.
 *
 * <p>Runs before the Spring Security filter chain (order -200, security is
 * registered at -100) so rejected requests (401/403) are logged too. Never
 * logs request bodies, query strings, cookies or tokens. Actuator endpoints
 * are skipped to avoid noise from health probes and Prometheus scrapes.</p>
 */
@Component
@Order(-200)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("HTTP_ACCESS");

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/actuator");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            chain.doFilter(request, response);
        } finally {
            long durationMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);
            String userId = attribute(request, "access_user_id");
            String tenantId = attribute(request, "access_tenant_id");
            log.info("{} {} status={} duration={}ms userId={} tenantId={}",
                    request.getMethod(), request.getRequestURI(), response.getStatus(),
                    durationMs, userId, tenantId);
        }
    }

    private String attribute(HttpServletRequest request, String name) {
        Object value = request.getAttribute(name);
        return value != null ? value.toString() : "-";
    }
}
