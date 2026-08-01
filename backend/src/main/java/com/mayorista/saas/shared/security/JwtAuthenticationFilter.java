package com.mayorista.saas.shared.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final TokenBlocklistService tokenBlocklistService;

    public JwtAuthenticationFilter(JwtService jwtService, TokenBlocklistService tokenBlocklistService) {
        this.jwtService = jwtService;
        this.tokenBlocklistService = tokenBlocklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = jwtService.parseAccessToken(token);
            String jti = claims.getId();
            if (tokenBlocklistService.isBlocked(jti)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token bloqueado");
                return;
            }

            UUID userId = UUID.fromString(claims.getSubject());

            // Reject users whose sessions were revoked on deactivation (key set by
            // AuthService/UserService). This is one Redis lookup — the same cost
            // class as the jti check above — with no database hit per request.
            if (tokenBlocklistService.isUserBlocked(userId)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Usuario desactivado");
                return;
            }

            UUID tenantId = UUID.fromString(String.valueOf(claims.get("tenant_id")));

            // Store access token info for downstream use (e.g. logout blocklist,
            // access logging)
            request.setAttribute("access_jti", jti);
            request.setAttribute("access_token", token);
            request.setAttribute("access_user_id", userId.toString());
            request.setAttribute("access_tenant_id", tenantId.toString());

            String role = String.valueOf(claims.get("rol"));

            JwtRequestPrincipal principal = new JwtRequestPrincipal(userId, tenantId, role);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, null, List.of(() -> "ROLE_" + role));
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            // Generic 401 message: never leak internal details (JWT parser internals,
            // Redis errors, UUID parsing) to the client. Full details go to the log.
            log.warn("Rejected request with invalid access token: {}", e.getMessage(), e);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
