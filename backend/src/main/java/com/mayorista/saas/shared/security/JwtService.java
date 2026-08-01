package com.mayorista.saas.shared.security;

import com.mayorista.saas.modules.users.domain.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private static final String[] KNOWN_WEAK_PATTERNS = {"change_me", "CHANGE_ME"};
    private static final int MIN_SAFE_LENGTH = 32;
    private static final int CRITICAL_LENGTH = 16;

    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;
    private final String accessSecretRaw;
    private final String refreshSecretRaw;

    public JwtService(
            @Value("${app.security.jwt.access-secret}") String accessSecret,
            @Value("${app.security.jwt.refresh-secret}") String refreshSecret,
            @Value("${app.security.jwt.access-ttl-seconds}") long accessTtlSeconds,
            @Value("${app.security.jwt.refresh-ttl-seconds}") long refreshTtlSeconds
    ) {
        this.accessSecretRaw = accessSecret;
        this.refreshSecretRaw = refreshSecret;
        this.accessKey = buildKey(accessSecret);
        this.refreshKey = buildKey(refreshSecret);
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    @PostConstruct
    public void validateSecrets() {
        validateSecret("access", accessSecretRaw);
        validateSecret("refresh", refreshSecretRaw);
    }

    private void validateSecret(String name, String secret) {
        if (secret == null || secret.length() < CRITICAL_LENGTH || isExactDefault(secret)) {
            log.error("JWT {} secret is critically weak (length={}). Application will fail.",
                    name, secret != null ? secret.length() : 0);
            throw new IllegalStateException(
                    "JWT " + name + " secret is dangerously weak. Must be at least " + CRITICAL_LENGTH + " chars and not a default value."
            );
        }
        if (secret.length() < MIN_SAFE_LENGTH || containsWeakPattern(secret)) {
            log.warn("JWT {} secret may be weak (length={}). Use a cryptographically generated 256-bit key.",
                    name, secret.length());
        }
    }

    private boolean isExactDefault(String secret) {
        for (String pattern : KNOWN_WEAK_PATTERNS) {
            if (secret.equals(pattern) || secret.equals(pattern + "_access_secret_very_long")
                    || secret.equals(pattern + "_refresh_secret_very_long")) {
                return true;
            }
        }
        return false;
    }

    private boolean containsWeakPattern(String secret) {
        for (String pattern : KNOWN_WEAK_PATTERNS) {
            if (secret.contains(pattern)) {
                return true;
            }
        }
        return false;
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
        if (rawSecret.length() >= 44) {
            try {
                keyBytes = Decoders.BASE64.decode(rawSecret);
                if (keyBytes.length >= MIN_SAFE_LENGTH) {
                    return Keys.hmacShaKeyFor(keyBytes);
                }
            } catch (Exception e) {
                // Not a valid Base64 string — fall through to raw bytes
            }
        }

        keyBytes = rawSecret.getBytes();
        if (keyBytes.length < MIN_SAFE_LENGTH) {
            throw new IllegalArgumentException(
                    "JWT secret must decode to at least 256 bits (" + MIN_SAFE_LENGTH + " bytes). "
                            + "Current secret yields " + keyBytes.length + " bytes."
            );
        }

        log.warn("JWT secret is not a valid 256-bit Base64 key. Using raw bytes. "
                + "Generate a proper key with: openssl rand -base64 32");
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
