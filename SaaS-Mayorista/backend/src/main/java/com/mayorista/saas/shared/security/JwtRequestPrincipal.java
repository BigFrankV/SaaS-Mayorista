package com.mayorista.saas.shared.security;

import java.util.UUID;

public record JwtRequestPrincipal(
        UUID userId,
        UUID tenantId,
        String role
) {
}
