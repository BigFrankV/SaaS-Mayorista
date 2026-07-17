package com.mayorista.saas.modules.sales.api;

import java.util.UUID;

public record DetalleResponse(
        UUID id,
        UUID productoId,
        String nombreProducto,
        int cantidad,
        int precioNetoHistorico
) {}
