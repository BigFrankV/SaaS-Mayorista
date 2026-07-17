package com.mayorista.saas.modules.sales.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record VentaResponse(
        UUID id,
        UUID tenantId,
        UUID usuarioId,
        String tipoDocumento,
        String rutCliente,
        String giroCliente,
        int totalNeto,
        int iva,
        int total,
        Instant fechaVenta,
        List<DetalleResponse> detalles
) {}
