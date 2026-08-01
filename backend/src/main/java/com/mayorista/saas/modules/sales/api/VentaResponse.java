package com.mayorista.saas.modules.sales.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record VentaResponse(
        UUID id,
        UUID tenantId,
        UUID usuarioId,
        String usuarioNombre,
        String tipoDocumento,
        String rutCliente,
        String giroCliente,
        String nombreCliente,
        int totalNeto,
        int iva,
        int total,
        Instant fechaVenta,
        boolean anulada,
        List<DetalleResponse> detalles
) {}
