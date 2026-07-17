package com.mayorista.saas.modules.auth.api;

import com.mayorista.saas.modules.users.domain.UserRole;

import java.util.UUID;

public record MeResponse(
        UUID userId,
        UUID tenantId,
        String email,
        String nombre,
        UserRole rol
) {}
