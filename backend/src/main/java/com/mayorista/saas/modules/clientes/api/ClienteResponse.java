package com.mayorista.saas.modules.clientes.api;

import com.mayorista.saas.modules.clientes.domain.ClienteEntity;

import java.time.Instant;
import java.util.UUID;

public record ClienteResponse(
        UUID id,
        String rut,
        String nombre,
        String giro,
        String direccion,
        String email,
        String telefono,
        boolean activo,
        Instant creadoEn
) {
    public static ClienteResponse from(ClienteEntity entity) {
        return new ClienteResponse(
                entity.getId(),
                entity.getRut(),
                entity.getNombre(),
                entity.getGiro(),
                entity.getDireccion(),
                entity.getEmail(),
                entity.getTelefono(),
                entity.isActivo(),
                entity.getCreadoEn()
        );
    }
}
