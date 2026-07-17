package com.mayorista.saas.modules.users.api;

import com.mayorista.saas.modules.users.domain.UserRole;

public record UpdateUserRequest(
        String email,
        String nombre,
        UserRole rol
) {}
