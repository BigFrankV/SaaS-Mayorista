package com.mayorista.saas.shared.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
                filterChain.doFilter(request, response);
                return;
            }

            UUID userId = UUID.fromString(claims.getSubject());
            UUID tenantId = UUID.fromString(String.valueOf(claims.get("tenant_id")));
            String role = String.valueOf(claims.get("rol"));

            JwtRequestPrincipal principal = new JwtRequestPrincipal(userId, tenantId, role);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, null, List.of(() -> "ROLE_" + role));
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception ignored) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
