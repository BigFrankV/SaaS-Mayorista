package com.mayorista.saas.modules.tenant.api;

import com.mayorista.saas.modules.tenant.domain.TenantEntity;

import java.time.Instant;
import java.util.UUID;

public record TenantResponse(UUID id, String nombreEmpresa, String rut, String giro, String direccion,
                             Instant creadoEn, boolean demo) {

    public static TenantResponse from(TenantEntity entity) {
        return new TenantResponse(
                entity.getId(),
                entity.getNombreEmpresa(),
                entity.getRut(),
                entity.getGiro(),
                entity.getDireccion(),
                entity.getCreadoEn(),
                entity.isDemo()
        );
    }
}
