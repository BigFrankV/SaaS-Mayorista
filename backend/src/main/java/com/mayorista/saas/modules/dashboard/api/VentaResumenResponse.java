package com.mayorista.saas.modules.dashboard.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mayorista.saas.modules.sales.domain.VentaEntity;

import java.time.Instant;
import java.util.UUID;

public record VentaResumenResponse(
        @JsonProperty("folio") String folio,
        @JsonProperty("cliente") String cliente,
        @JsonProperty("rut") String rut,
        @JsonProperty("total") int total,
        @JsonProperty("tipo") String tipo,
        @JsonProperty("fecha") String fecha
) {
    public static VentaResumenResponse from(VentaEntity entity) {
        return new VentaResumenResponse(
                entity.getId().toString().substring(0, 8).toUpperCase(),
                entity.getGiroCliente() != null ? entity.getGiroCliente() : "Sin giro",
                entity.getRutCliente() != null ? entity.getRutCliente() : "",
                entity.getTotal(),
                entity.getTipoDocumento(),
                entity.getFechaVenta().toString()
        );
    }
}
