package com.mayorista.saas.modules.users.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mayorista.saas.modules.users.domain.UserRole;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Size;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UpdateUserRequest(
        String email,
        String nombre,
        UserRole rol,
        @Nullable @Size(min = 6) String password
) {}
