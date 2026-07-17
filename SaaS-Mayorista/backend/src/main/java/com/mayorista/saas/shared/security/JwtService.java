package com.mayorista.saas.shared.security;

import com.mayorista.saas.modules.users.domain.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    public JwtService(
            @Value("${app.security.jwt.access-secret}") String accessSecret,
            @Value("${app.security.jwt.refresh-secret}") String refreshSecret,
            @Value("${app.security.jwt.access-ttl-seconds}") long accessTtlSeconds,
            @Value("${app.security.jwt.refresh-ttl-seconds}") long refreshTtlSeconds
    ) {
        this.accessKey = buildKey(accessSecret);
        this.refreshKey = buildKey(refreshSecret);
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    public JwtTokenData generateAccessToken(UserEntity user) {
        return generateToken(user, JwtTokenType.ACCESS, accessTtlSeconds, accessKey);
    }

    public JwtTokenData generateRefreshToken(UserEntity user) {
        return generateToken(user, JwtTokenType.REFRESH, refreshTtlSeconds, refreshKey);
    }

    public Claims parseAccessToken(String token) {
        return parseClaims(token, accessKey, JwtTokenType.ACCESS);
    }

    public Claims parseRefreshToken(String token) {
        return parseClaims(token, refreshKey, JwtTokenType.REFRESH);
    }

    private JwtTokenData generateToken(UserEntity user, JwtTokenType type, long ttlSeconds, SecretKey key) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(ttlSeconds);
        String jti = UUID.randomUUID().toString();

        String token = Jwts.builder()
                .subject(user.getId().toString())
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .claims(Map.of(
                        "tenant_id", user.getTenantId().toString(),
                        "rol", user.getRol().name(),
                        "type", type.name()
                ))
                .signWith(key)
                .compact();

        return new JwtTokenData(token, jti, expiresAt);
    }

    private Claims parseClaims(String token, SecretKey key, JwtTokenType expectedType) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String type = String.valueOf(claims.get("type"));
        if (!expectedType.name().equals(type)) {
            throw new IllegalArgumentException("Tipo de token invalido");
        }
        return claims;
    }

    private SecretKey buildKey(String rawSecret) {
        byte[] keyBytes;
        if (rawSecret.matches("^[A-Za-z0-9+/=]+$") && rawSecret.length() > 43) {
            keyBytes = Decoders.BASE64.decode(rawSecret);
        } else {
            keyBytes = rawSecret.getBytes();
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
