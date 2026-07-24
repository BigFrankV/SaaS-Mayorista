package com.mayorista.saas.modules.categories.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mayorista.saas.modules.categories.domain.CategoryEntity;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        @JsonProperty("tenantId") UUID tenantId,
        String nombre,
        boolean activo,
        @JsonProperty("creadoEn") Instant creadoEn
) {
    public static CategoryResponse from(CategoryEntity entity) {
        return new CategoryResponse(
                entity.getId(),
                entity.getTenantId(),
                entity.getNombre(),
                entity.isActivo(),
                entity.getCreadoEn()
        );
    }
}
