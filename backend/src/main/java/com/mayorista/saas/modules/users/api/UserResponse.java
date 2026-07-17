package com.mayorista.saas.modules.users.api;

import com.mayorista.saas.modules.users.domain.UserEntity;
import com.mayorista.saas.modules.users.domain.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String nombre,
        UserRole rol,
        boolean activo,
        Instant creadoEn
) {
    public static UserResponse from(UserEntity entity) {
        return new UserResponse(
                entity.getId(),
                entity.getEmail(),
                entity.getNombre(),
                entity.getRol(),
                entity.isActivo(),
                entity.getCreadoEn()
        );
    }
}
