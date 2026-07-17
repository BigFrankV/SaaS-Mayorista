package com.mayorista.saas.shared.security;

import java.time.Instant;

public record JwtTokenData(
        String token,
        String jti,
        Instant expiresAt
) {
}
